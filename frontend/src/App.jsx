import { useEffect, useState } from "react";
import "./App.css";

const emptyForm = {
    name: "",
    surname: "",
    initials: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    relationship: "",
    company: "",
    designation: ""
};

function App() {
    const [showForm, setShowForm] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchContacts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/contacts");
            const data = await response.json();

            if (data.success) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/contacts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (data.success) {
                setMessage("Contact saved successfully");

                setFormData(emptyForm);

                setShowForm(false);

                fetchContacts();
            } else {
                setMessage(data.message || "Failed to save contact");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Backend connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div>
                    <h1>Contact Vault</h1>
                    <p>Manage your personal and professional contacts</p>
                </div>

                <button
                    className="add-button"
                    onClick={() => setShowForm(true)}
                >
                    + Add Contact
                </button>
            </header>

            <main className="main">
                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                <div className="toolbar">
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="search-input"
                    />

                    <button className="export-button">
                        Export Excel
                    </button>
                </div>

                <section className="contact-section">
                    <div className="section-header">
                        <div>
                            <h2>Your Contacts</h2>
                            <p>{contacts.length} contacts saved</p>
                        </div>
                    </div>

                    {contacts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👤</div>

                            <h3>No contacts yet</h3>

                            <p>
                                Add your first contact to start building
                                your Contact Vault.
                            </p>

                            <button
                                className="empty-button"
                                onClick={() => setShowForm(true)}
                            >
                                + Add Your First Contact
                            </button>
                        </div>
                    ) : (
                        <div className="contacts-list">
                            {contacts.map((contact) => (
                                <div
                                    className="contact-card"
                                    key={contact._id}
                                >
                                    <div className="contact-info">
                                        <h3>
                                            {contact.name}{" "}
                                            {contact.surname}
                                        </h3>

                                        <p>
                                            {contact.relationship ||
                                                "Contact"}
                                        </p>

                                        <span>
                                            {contact.phone}
                                        </span>

                                        {contact.company && (
                                            <span>
                                                {contact.company}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h2>Add New Contact</h2>
                                <p>Enter the contact details below</p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="contact-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-section">
                                <h3>Personal Information</h3>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Surname</label>
                                        <input
                                            type="text"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleChange}
                                            placeholder="Enter surname"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Initials</label>
                                        <input
                                            type="text"
                                            name="initials"
                                            value={formData.initials}
                                            onChange={handleChange}
                                            placeholder="Enter initials"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select blood group
                                            </option>
                                            <option>O+</option>
                                            <option>O-</option>
                                            <option>A+</option>
                                            <option>A-</option>
                                            <option>B+</option>
                                            <option>B-</option>
                                            <option>AB+</option>
                                            <option>AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Contact Information</h3>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Alternate Phone</label>
                                        <input
                                            type="tel"
                                            name="alternatePhone"
                                            value={formData.alternatePhone}
                                            onChange={handleChange}
                                            placeholder="Enter alternate number"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter address"
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Family Information</h3>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Father Name</label>
                                        <input
                                            type="text"
                                            name="fatherName"
                                            value={formData.fatherName}
                                            onChange={handleChange}
                                            placeholder="Enter father name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mother Name</label>
                                        <input
                                            type="text"
                                            name="motherName"
                                            value={formData.motherName}
                                            onChange={handleChange}
                                            placeholder="Enter mother name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Professional Information</h3>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Enter company"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Designation</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            placeholder="Enter designation"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Relationship</h3>

                                <div className="form-group full-width">
                                    <label>Relationship</label>
                                    <input
                                        type="text"
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleChange}
                                        placeholder="Example: College Friend"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : "Save Contact"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;