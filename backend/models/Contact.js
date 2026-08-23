const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        surname: {
            type: String,
            trim: true
        },

        initials: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        alternatePhone: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            trim: true
        },

        bloodGroup: {
            type: String,
            trim: true
        },

        fatherName: {
            type: String,
            trim: true
        },

        motherName: {
            type: String,
            trim: true
        },

        relationship: {
            type: String,
            trim: true
        },

        company: {
            type: String,
            trim: true
        },

        designation: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Contact", contactSchema);