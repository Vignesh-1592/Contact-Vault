const Contact = require("../models/Contact");

// CREATE CONTACT
const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.user.userId,

      tags: Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags
        ? req.body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create contact",
      error: error.message,
    });
  }
};

// GET ALL CONTACTS
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch contacts",
      error: error.message,
    });
  }
};

// GET SINGLE CONTACT
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch contact",
      error: error.message,
    });
  }
};

// UPDATE CONTACT
const updateContact = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // Never allow frontend to change ownership
    delete updateData.userId;

    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update contact",
      error: error.message,
    });
  }
};

// DELETE CONTACT
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete contact",
      error: error.message,
    });
  }
};

// TOGGLE FAVORITE
const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    contact.favorite = !contact.favorite;

    await contact.save();

    res.status(200).json({
      success: true,
      message: contact.favorite
        ? "Contact added to favorites"
        : "Contact removed from favorites",
      contact,
    });
  } catch (error) {
    console.error("Favorite update error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update favorite",
      error: error.message,
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  toggleFavorite,
};