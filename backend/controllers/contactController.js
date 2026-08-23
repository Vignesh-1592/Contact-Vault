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

const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact",
            error: error.message
        });
    }
};

const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update contact",
            error: error.message
        });
    }
};

const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete contact",
            error: error.message
        });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};