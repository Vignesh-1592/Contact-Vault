import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

const API_URL = "http://localhost:5000/api/contacts";

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
  designation: "",
};

function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        setMessage("Failed to load contacts");
      }
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddContact = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Operation failed");
        return;
      }

      if (editingId) {
        setMessage("Contact updated successfully");
      } else {
        setMessage("Contact saved successfully");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchContacts();
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (data.success) {
        const contact = data.contact;

        setForm({
          name: contact.name || "",
          surname: contact.surname || "",
          initials: contact.initials || "",
          phone: contact.phone || "",
          alternatePhone: contact.alternatePhone || "",
          email: contact.email || "",
          address: contact.address || "",
          bloodGroup: contact.bloodGroup || "",
          fatherName: contact.fatherName || "",
          motherName: contact.motherName || "",
          relationship: contact.relationship || "",
          company: contact.company || "",
          designation: contact.designation || "",
        });

        setEditingId(id);
        setShowForm(true);
      } else {
        setMessage("Contact not found");
      }
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Failed to delete contact");
        return;
      }

      setMessage("Contact deleted successfully");

      await fetchContacts();
    } catch (error) {
      console.error(error);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchText = search.toLowerCase();

    return (
      (contact.name || "").toLowerCase().includes(searchText) ||
      (contact.surname || "").toLowerCase().includes(searchText) ||
      (contact.initials || "").toLowerCase().includes(searchText) ||
      (contact.phone || "").toLowerCase().includes(searchText) ||
      (contact.alternatePhone || "")
        .toLowerCase()
        .includes(searchText) ||
      (contact.email || "").toLowerCase().includes(searchText) ||
      (contact.address || "").toLowerCase().includes(searchText) ||
      (contact.bloodGroup || "").toLowerCase().includes(searchText) ||
      (contact.fatherName || "")
        .toLowerCase()
        .includes(searchText) ||
      (contact.motherName || "")
        .toLowerCase()
        .includes(searchText) ||
      (contact.relationship || "")
        .toLowerCase()
        .includes(searchText) ||
      (contact.company || "").toLowerCase().includes(searchText) ||
      (contact.designation || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  const handleExportExcel = () => {
    if (contacts.length === 0) {
      setMessage("No contacts available to export");
      return;
    }

    const excelData = contacts.map((contact) => ({
      Name: contact.name || "",
      Surname: contact.surname || "",
      Initials: contact.initials || "",
      Phone: contact.phone || "",
      "Alternate Phone": contact.alternatePhone || "",
      Email: contact.email || "",
      Address: contact.address || "",
      "Blood Group": contact.bloodGroup || "",
      "Father Name": contact.fatherName || "",
      "Mother Name": contact.motherName || "",
      Relationship: contact.relationship || "",
      Company: contact.company || "",
      Designation: contact.designation || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Contacts"
    );

    XLSX.writeFile(
      workbook,
      "Contact_Vault.xlsx"
    );

    setMessage("Contacts exported successfully");
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
          onClick={handleAddContact}
        >
          + Add Contact
        </button>
      </header>

      <main className="container">

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <div className="search-section">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="export-button"
            onClick={handleExportExcel}
          >
            Export Excel
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <div className="form-header">
              <h2>
                {editingId
                  ? "Edit Contact"
                  : "Add New Contact"}
              </h2>

              <button
                className="close-button"
                onClick={handleCancel}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Surname</label>
                  <input
                    type="text"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Initials</label>
                  <input
                    type="text"
                    name="initials"
                    value={form.initials}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Alternate Phone</label>
                  <input
                    type="text"
                    name="alternatePhone"
                    value={form.alternatePhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    placeholder="Example: O+"
                  />
                </div>

                <div className="form-group">
                  <label>Father Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={form.fatherName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Mother Name</label>
                  <input
                    type="text"
                    name="motherName"
                    value={form.motherName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    name="relationship"
                    value={form.relationship}
                    onChange={handleChange}
                    placeholder="Example: College Friend"
                  />
                </div>

                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Example: Software Engineer"
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
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
                    : editingId
                    ? "Update Contact"
                    : "Save Contact"}
                </button>

              </div>

            </form>
          </div>
        )}

        <section className="contacts-section">

          <div className="contacts-header">
            <div>
              <h2>Your Contacts</h2>
              <p>
                {contacts.length}{" "}
                {contacts.length === 1
                  ? "contact"
                  : "contacts"}{" "}
                saved
              </p>
            </div>
          </div>

          {loading && contacts.length === 0 ? (
            <div className="empty-state">
              <h3>Loading contacts...</h3>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                👤
              </div>

              <h3>
                {search
                  ? "No contacts found"
                  : "No contacts yet"}
              </h3>

              <p>
                {search
                  ? "Try a different search term."
                  : "Add your first contact to start building your Contact Vault."}
              </p>

              {!search && (
                <button
                  className="first-contact-button"
                  onClick={handleAddContact}
                >
                  + Add Your First Contact
                </button>
              )}

            </div>
          ) : (
            <div className="contacts-grid">

              {filteredContacts.map((contact) => (
                <div
                  className="contact-card"
                  key={contact._id}
                >

                  <div className="contact-info">

                    <h3>
                      {contact.name}{" "}
                      {contact.surname}
                    </h3>

                    {contact.relationship && (
                      <p className="relationship">
                        {contact.relationship}
                      </p>
                    )}

                    {contact.phone && (
                      <p>
                        📞 {contact.phone}
                      </p>
                    )}

                    {contact.email && (
                      <p>
                        ✉️ {contact.email}
                      </p>
                    )}

                    {contact.company && (
                      <p>
                        🏢 {contact.company}
                      </p>
                    )}

                    {contact.designation && (
                      <p>
                        💼 {contact.designation}
                      </p>
                    )}

                  </div>

                  <div className="contact-actions">

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(contact._id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(contact._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default App;