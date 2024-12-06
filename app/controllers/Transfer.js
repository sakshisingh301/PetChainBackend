const TransferRequest = require("../model/transferRequest");
const crypto = require("crypto");
const Pet = require("../model/pet");
const nodemailer = require("nodemailer");
const { executeSmartContract } = require("../contracts/execute");
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
    });
    await transferRequest.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const approvalLink = `${process.env.FRONTEND_URL}/api/transfer/approve-transfer?token=${approvalToken}`;
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
  console.log("Approve Transfer func hit");
  const { token } = req.query;

  try {
    const transferRequest = await TransferRequest.findOne({
      approvalToken: token,
    });

    if (!transferRequest) {
      return res
        .status(404)
        .json({ message: "Invalid or expired approval token." });
    }

    const currentOwnerId = await fetchCustomIdFromMongoDB(transferRequest.currentOwnerEmail);
    const ownershipData = await fetchPetIdFromResDB(currentOwnerId);

    if (!ownershipData || ownershipData.pet_id !== transferRequest.petId) {
      return res.status(404).json({ message: "Ownership validation failed." });
    }

    const newOwnerId = await fetchCustomIdFromMongoDB(transferRequest.newOwnerEmail);

    transferRequest.status = "approved";
    await transferRequest.save();

    const contractAddress = process.env.CONTRACT_ADDRESS; 
    const senderAddress = process.env.ACCOUNT_ADDRESS; 
    const functionName = "balanceOf(address)";
    const args = "0x1be8e78d765a2e63339fc99a66320db73158a35a";

    const result = await executeSmartContract(
      contractAddress,
      senderAddress,
      functionName,
      args
    );

    console.log("Smart contract execution result:", result);


    if (!result.success) {
      throw new Error("Smart contract execution failed.");
    }

    const transferHash = crypto
      .createHash("sha256")
      .update(`${transferRequest.petId}${transferRequest.currentOwnerEmail}${transferRequest.newOwnerEmail}`)
      .digest("hex");

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
    console.error("Error approving transfer:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while approving the transfer." });
  }
};
