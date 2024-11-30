const TransferRequest = require("../model/transferRequest");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Pet = require("../model/pet");
const { getOwnershipFromResdb, storingOwnershipTransferEventInResdb  } = require("../utils/util");

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
      .json({ message: "An error occurred while initiating the transfer." });
  }
};

exports.approveTransfer = async (req, res) => {
  const { token } = req.query;

  try {
    // Find the transfer request
    const transferRequest = await TransferRequest.findOne({
      approvalToken: token,
    });

    if (!transferRequest) {
      return res
        .status(404)
        .json({ message: "Invalid or expired approval token." });
    }

    const ownershipData = await getOwnershipFromResdb(transferRequest.petId);
    if (!ownershipData) {
      return res
        .status(404)
        .json({ message: "Ownership details not found in ResDB." });
    }

    if (ownershipData.owner_id !== transferRequest.currentOwnerEmail) {
      return res.status(403).json({ message: "Ownership validation failed." });
    }

    transferRequest.status = "approved";
    await transferRequest.save();

    const result = await executeSmartContract(
      transferRequest.petId,
      ownershipData.owner_id,
      transferRequest.newOwnerEmail
    );

    if (!result.success) {
      throw new Error("Smart contract execution failed.");
    }

    const transferHash = result.transactionHash || "dummyHashForTesting"; 
    await storingOwnershipTransferEventInResdb(
      ownershipData.id, 
      transferRequest.petId,
      ownershipData.id,
      transferRequest.newOwnerEmail,
      transferHash
    );

    res.status(200).json({
      message: "Ownership transfer approved, executed, and logged in ResDB.",
    });
  } catch (error) {
    console.error("Error approving transfer:", error);
    res
      .status(500)
      .json({ message: "An error occurred while approving the transfer." });
  }
};
