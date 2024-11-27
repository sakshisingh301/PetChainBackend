const PetModel = require('../model/pet')
const mongoose = require('mongoose');
const UserModel = require('../model/register');
const nodemailer = require('nodemailer'); // For email notifications
const NotificationModel = require('../model/notification'); // For in-app notifications

// Notify owner about the pet
exports.notifyOwner = async (req, res) => {
  const { petId, finderAddress } = req.body;

  try {
    // 1. Find the pet by petId
    const pet = await PetModel.findOne({ petId });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }
    console.log("pets: ", pet)

    // 2. Find the owner by ownerId in the pet record
    const owner = await UserModel.findOne({ custom_id: pet.owner_id });
    console.log("owner is :",owner)
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    const ownerEmail = owner.email; // Owner's email
    const petName = pet.name;
    console.log("ownerEmail :",ownerEmail)
    console.log("petName :",petName)

    // 3. Send Notification to the Owner
    const notificationMessage = `Your pet "${petName}" has been reported near the following address: ${finderAddress}.`;

    // Example: Send email notification
    await sendEmailToOwner(ownerEmail, petName, finderAddress);

    // Optionally: Log the notification in the database for in-app notifications
    const notification = new NotificationModel({
      ownerId: pet.owner_id,
      message: notificationMessage,
      isRead: false,
    });
    console.log('notification :',notification)
    await notification.save();

    res.status(200).json({ message: 'The owner has been notified successfully.' });
  } catch (error) {
    console.error('Error notifying owner:', error.message);
    res.status(500).json({ message: 'An error occurred while notifying the owner.' });
  }
};

// Helper function to send email
const sendEmailToOwner = async (ownerEmail, petName, finderAddress) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: "binarybeast001@gmail.com",
      pass: "qpvp nylt btfj yiil",
    },
  });

  const mailOptions = {
    from: '"PetChain" <petchain@example.com>',
    to: "binarybeast001@gmail.com",
    subject: `Good news! Your pet "${petName}" has been located.`,
    text: `Hello,\n\nYour pet "${petName}" has been reported near the following address:\n\n${finderAddress}.\n\nPlease log in to PetChain for more details.`,
  };

  await transporter.sendMail(mailOptions);
};

exports.getNotifications = async (req, res) => {
    const { ownerId } = req.query; // Pass the owner ID in the query string
    console.log('owner ID is :',ownerId)
  
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required.' });
    }
  
    try {

      // Fetch unread notifications for the provided owner ID
      const notifications = await NotificationModel.find({ ownerId, isRead: false });
      console.log("notification is", notifications)
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ message: 'Error fetching notifications.' });
    }
  };
  
  
  exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params; // Notification ID

    try {
      const notification = await NotificationModel.findByIdAndUpdate(id, { isRead: true });
      if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  
      res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      res.status(500).json({ message: 'Error updating notification.' });
    }
  };
  