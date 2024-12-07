const TransferRequest = require("../model/transferRequest");
const crypto = require("crypto");
const Pet = require("../model/pet");
const nodemailer = require("nodemailer");
// const { executeSmartContract } = require("../contracts/execute");
const { getOwnershipFromResdb, storingOwnershipTransferEventInResdb, fetchCustomIdFromMongoDB, fetchPetIdFromResDB } = require("../utils/util");

exports.initiateTransfer = async (req, res) => {
  const { petId, currentOwnerEmail, newOwnerEmail } = req.body;
  console.log("Request received:", req.body);

  if (!petId || !currentOwnerEmail || !newOwnerEmail) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const pet = await Pet.findOne({ petId });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    const { name: petName, breed, gender, age } = pet;
    const approvalToken = crypto.randomBytes(20).toString("hex");

    // Save transfer request in db
    const transferRequest = new TransferRequest({
      petId,
      currentOwnerEmail,
      newOwnerEmail,
      approvalToken,
      status: "Pending approval from New Owner",
    });
    await transferRequest.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const approvalLink = `${process.env.FRONTEND_URL}/approve-transfer?token=${approvalToken}`;
    await transporter.sendMail({
      from: '"PetChain Team" <no-reply@petchain.com>',
      to: newOwnerEmail,
      subject: `Ownership Transfer Request for ${petName}`,
      text:
        `Hello,\n\n` +
        `The current owner of ${petName} (${breed}, ${gender}, ${age}) has initiated a request to transfer ownership to you. ` +
        `To proceed, please click the link below to approve or reject this request:\n\n` +
        `${approvalLink}\n\n` +
        `If you did not request this, please ignore this email.\n\n` +
        `Thank you for being part of PetChain!\n\n` +
        `Best Regards,\n` +
        `PetChain Team`,
      html: `
        <p>Hello,</p>
        <p>
          The current owner of <strong>${petName}</strong> 
          (<em>${breed}, ${gender}, ${age}</em>) has initiated a request to transfer ownership to you.
        </p>
        <p>To proceed, click the button below:</p>
        <p>
          <a href="${approvalLink}" style="
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            text-align: center;
            text-decoration: none;
            font-size: 16px;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 10px 0;
          " target="_blank">Approve Ownership Transfer</a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you for being part of PetChain!</p>
        <p>Best Regards,<br>PetChain Team</p>
      `,
    });

    res
      .status(200)
      .json({ message: "Transfer request initiated. Approval email sent." });
  } catch (error) {
    console.error("Error initiating transfer:", error);
    res
      .status(500)
      .json({ message: "An error occurred while initiating the transfer process" });
  }
};

exports.approveTransfer = async (req, res) => {
  console.log("Approve Transfer func hit");
  const { token } = req.query;

  try {
    const transferRequest = await TransferRequest.findOne({
      approvalToken: token,
    });

    if (!transferRequest) {
      res.send(`
        <script>
          alert('Invalid or expired approval token.');
        </script>
      `);
      return;
    }

    const currentOwnerId = await fetchCustomIdFromMongoDB(transferRequest.currentOwnerEmail);
    if (!currentOwnerId) {
      return res.status(404).json({ message: "Current owner not found." });
    }
    console.log("Current Owner ID:", currentOwnerId);

    const ownershipData = await getOwnershipFromResdb(currentOwnerId);
    console.log("Ownership Data Pet ID:", ownershipData.value.pet_id);
    console.log("Transfer Request Pet ID:", transferRequest.petId);
    if (!ownershipData || ownershipData.value.pet_id !== transferRequest.petId) {
      res.send(`
        <script>
          alert('Current Ownership validation failed. Rejecting proposal');
        </script>
      `);
      return;
    }

    const newOwnerId = await fetchCustomIdFromMongoDB(transferRequest.newOwnerEmail);
    if (!newOwnerId) {
      return res.status(404).json({ message: "New owner not found." });
    }

    const transferHash = crypto
      .createHash("sha256")
      .update(`${transferRequest.petId}${transferRequest.currentOwnerEmail}${transferRequest.newOwnerEmail}`)
      .digest("hex");

    await storingOwnershipTransferEventInResdb(
      ownershipData.id,
      transferRequest.petId,
      newOwnerId,
      transferRequest.newOwnerEmail,
      transferHash
    );

    console.log("Ownership transfer event logged in ResDB successfully.");

    transferRequest.status = "Approved & Executed";
    await transferRequest.save();

    res.send(`
      <script>
        alert('Ownership transfer approved and logged successfully!');
        window.location.href = '${process.env.FRONTEND_URL}pprofile';
      </script>
    `);
  } catch (error) {
    console.error("Error approving transfer:", error.message);
    if (transferRequest) {
      transferRequest.status = "Rejected";
      await transferRequest.save();
    }
    res.status(500).send(`
      <script>
        alert('An error occurred while approving the transfer. Transfer rejected.');
      </script>
    `);
  }
};


exports.getTransfers = async (req, res) => {
  const { ownerEmail } = req.params;

  if (!ownerEmail) {
    return res.status(400).json({ message: "Owner email is required." });
  }

  try {
    const transferRequests = await TransferRequest.find({
      currentOwnerEmail: ownerEmail,
    });

    if (!transferRequests || transferRequests.length === 0) {
      return res.status(404).json({ message: "No transfer requests found." });
    }

    res.status(200).json(transferRequests);
  } catch (error) {
    console.error("Error fetching transfer requests:", error.message);
    res.status(500).json({ message: "An error occurred while fetching transfer requests." });
  }
};

