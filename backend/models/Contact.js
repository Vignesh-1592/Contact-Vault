const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic
    name: {
      type: String,
      required: true,
      trim: true,
    },

    surname: {
      type: String,
      trim: true,
    },

    nickname: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      trim: true,
    },

    relationship: {
      type: String,
      trim: true,
    },

    // Contact
    phone: {
      type: String,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    workEmail: {
      type: String,
      trim: true,
    },

    // Address
    addressLine1: {
      type: String,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    pinCode: {
      type: String,
      trim: true,
    },

    // Professional
    company: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    employeeId: {
      type: String,
      trim: true,
    },

    workLocation: {
      type: String,
      trim: true,
    },

    // Education
    institution: {
      type: String,
      trim: true,
    },

    course: {
      type: String,
      trim: true,
    },

    registerNumber: {
      type: String,
      trim: true,
    },

    yearOfStudy: {
      type: String,
      trim: true,
    },

    graduationYear: {
      type: String,
      trim: true,
    },

    // Family
    fatherName: {
      type: String,
      trim: true,
    },

    fatherPhone: {
      type: String,
      trim: true,
    },

    motherName: {
      type: String,
      trim: true,
    },

    motherPhone: {
      type: String,
      trim: true,
    },

    // Online
    linkedin: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    personalWebsite: {
      type: String,
      trim: true,
    },

    // Additional
    bloodGroup: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);