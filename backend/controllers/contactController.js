const Contact = require("../models/Contact");

const createContact = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create contact",
            error: error.message
        });
    }
};

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts",
            error: error.message
        });
    }
};

module.exports = {
    createContact,
    getContacts
};