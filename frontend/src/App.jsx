import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

import { useAuth } from "./Auth.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

const API_URL =
  "https://contact-vault-api.onrender.com/api/contacts";

const emptyContact = {
  name: "",
  surname: "",
  nickname: "",
  dateOfBirth: "",
  gender: "",
  relationship: "",

  phone: "",
  alternatePhone: "",
  whatsappNumber: "",
  email: "",
  workEmail: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",

  company: "",
  designation: "",
  department: "",
  employeeId: "",
  workLocation: "",

  institution: "",
  course: "",
  registerNumber: "",
  yearOfStudy: "",
  graduationYear: "",

  fatherName: "",
  fatherPhone: "",
  motherName: "",
  motherPhone: "",

  linkedin: "",
  github: "",
  personalWebsite: "",

  bloodGroup: "",
  notes: "",
  tags: "",
  favorite: false,
};

function App() {
  const {
    user,
    token,
    loading: authLoading,
    logout,
  } = useAuth();

  const [showRegister, setShowRegister] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyContact);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [viewingContact, setViewingContact] = useState(null);
  const [showView, setShowView] = useState(false);

  useEffect(() => {
    if (token) {
      fetchContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [token]);

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const fetchContacts = async () => {
    if (!token) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          data.message === "Invalid or expired token" ||
          data.message === "Authentication required"
        ) {
          logout();
          return;
        }

        throw new Error(
          data.message || "Failed to fetch contacts"
        );
      }

      setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddForm = () => {
    setEditingContact(null);
    setFormData(emptyContact);
    setShowForm(true);
    setActivePage("add");
  };

  const openEditForm = (contact) => {
    setEditingContact(contact);

    setFormData({
      ...emptyContact,
      ...contact,
      dateOfBirth: contact.dateOfBirth
        ? String(contact.dateOfBirth).substring(0, 10)
        : "",
      tags: Array.isArray(contact.tags)
        ? contact.tags.join(", ")
        : contact.tags || "",
    });

    setShowForm(true);
    setActivePage("add");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData(emptyContact);
    setActivePage("contacts");
  };

  const openViewContact = (contact) => {
    setViewingContact(contact);
    setShowView(true);
  };

  const closeViewContact = () => {
    setViewingContact(null);
    setShowView(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      let response;

      if (editingContact) {
        response = await fetch(
          `${API_URL}/${editingContact._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Operation failed"
        );
      }

      await fetchContacts();

      showMessage(
        editingContact
          ? "Contact updated successfully"
          : "Contact saved successfully"
      );

      closeForm();
      setActivePage("contacts");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to save contact"
      );
    }
  };

  const deleteContact = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Delete failed"
        );
      }

      setContacts((previous) =>
        previous.filter(
          (contact) => contact._id !== id
        )
      );

      showMessage("Contact deleted successfully");
    } catch (err) {
      console.error(err);
      setError("Unable to delete contact");
    }
  };

  const toggleFavorite = async (contact) => {
    try {
      const response = await fetch(
        `${API_URL}/${contact._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...contact,
            favorite: !contact.favorite,
            tags: Array.isArray(contact.tags)
              ? contact.tags
              : contact.tags
              ? contact.tags
                  .split(",")
                  .map((tag) => tag.trim())
              : [],
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Favorite update failed"
        );
      }

      const updatedContact = data.contact;

      setContacts((previous) =>
        previous.map((item) =>
          item._id === contact._id
            ? updatedContact
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update favorite");
    }
  };

  const filteredContacts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      return contacts;
    }

    return contacts.filter((contact) => {
      const values = [
        contact.name,
        contact.surname,
        contact.nickname,
        contact.phone,
        contact.email,
        contact.company,
        contact.designation,
        contact.relationship,
        contact.city,
        contact.state,
        contact.country,
        contact.tags,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [contacts, searchTerm]);

  const favoriteContacts = contacts.filter(
    (contact) => contact.favorite === true
  );

  const companies = useMemo(() => {
    const companySet = new Set();

    contacts.forEach((contact) => {
      if (contact.company) {
        companySet.add(contact.company.trim());
      }
    });

    return [...companySet];
  }, [contacts]);

  const locations = useMemo(() => {
    const locationSet = new Set();

    contacts.forEach((contact) => {
      const location = [
        contact.city,
        contact.state,
      ]
        .filter(Boolean)
        .join(", ");

      if (location) {
        locationSet.add(location);
      }
    });

    return [...locationSet];
  }, [contacts]);

  const exportExcel = () => {
    if (contacts.length === 0) {
      showMessage(
        "No contacts available to export"
      );
      return;
    }

    const excelData = contacts.map((contact) => ({
      "First Name": contact.name || "",
      "Last Name": contact.surname || "",
      Nickname: contact.nickname || "",
      "Date of Birth": contact.dateOfBirth || "",
      Gender: contact.gender || "",
      Relationship: contact.relationship || "",

      "Primary Phone": contact.phone || "",
      "Alternate Phone":
        contact.alternatePhone || "",
      "WhatsApp Number":
        contact.whatsappNumber || "",
      "Personal Email": contact.email || "",
      "Work/College Email":
        contact.workEmail || "",

      "Address Line 1":
        contact.addressLine1 || "",
      "Address Line 2":
        contact.addressLine2 || "",
      City: contact.city || "",
      State: contact.state || "",
      Country: contact.country || "",
      "PIN Code": contact.pinCode || "",

      Company: contact.company || "",
      Designation: contact.designation || "",
      Department: contact.department || "",
      "Employee ID": contact.employeeId || "",
      "Work Location":
        contact.workLocation || "",

      Institution: contact.institution || "",
      Course: contact.course || "",
      "Register Number":
        contact.registerNumber || "",
      "Year of Study":
        contact.yearOfStudy || "",
      "Graduation Year":
        contact.graduationYear || "",

      "Father Name":
        contact.fatherName || "",
      "Father Phone Number":
        contact.fatherPhone || "",
      "Mother Name":
        contact.motherName || "",
      "Mother Phone Number":
        contact.motherPhone || "",

      LinkedIn: contact.linkedin || "",
      GitHub: contact.github || "",
      "Personal Website":
        contact.personalWebsite || "",

      "Blood Group":
        contact.bloodGroup || "",
      Notes: contact.notes || "",
      Tags: Array.isArray(contact.tags)
        ? contact.tags.join(", ")
        : contact.tags || "",
      Favorite: contact.favorite
        ? "Yes"
        : "No",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Contacts"
    );

    XLSX.writeFile(
      workbook,
      "Contact_Vault_Contacts.xlsx"
    );

    showMessage("Excel exported successfully");
  };

  const renderSidebar = () => {
    return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            CV
          </div>
          <div>
            <h1>Contact Vault</h1>
            <span>Personal Network</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowForm(false);
              setActivePage("dashboard");
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "add"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={openAddForm}
          >
            <span>＋</span>
            Add Contact
          </button>

          <button
            className={
              activePage === "contacts"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowForm(false);
              setActivePage("contacts");
            }}
          >
            <span>♟</span>
            Contacts
          </button>

          <button
            className={
              activePage === "search"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowForm(false);
              setActivePage("search");
            }}
          >
            <span>⌕</span>
            Search
          </button>

          <button
            className={
              activePage === "export"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowForm(false);
              setActivePage("export");
            }}
          >
            <span>⇩</span>
            Export
          </button>

          <button
            className={
              activePage === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowForm(false);
              setActivePage("settings");
            }}
          >
            <span>⚙</span>
            Settings
          </button>

          <button
  className="nav-item"
  onClick={() => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?\n\nYou will need to sign in again to access your Contact Vault."
    );

    if (confirmed) {
      logout();
    }
  }}
>
  <span>↪</span>
  Logout
</button>


        </nav>

        <div className="sidebar-bottom">
          <div className="secure-box">
            <div className="secure-icon">
              🔒
            </div>

            <div>
              <strong>Secure Vault</strong>
              <small>
                Your contacts are safe
              </small>
            </div>
          </div>
        </div>
      </aside>
    );
  };

  const renderTopbar = () => {
    return (
      <header className="topbar">
        <div>
          <p className="topbar-label">
            CONTACT MANAGEMENT
          </p>

          <h2>
            {activePage === "dashboard" &&
              "Dashboard"}

            {activePage === "contacts" &&
              "All Contacts"}

            {activePage === "add" &&
              (editingContact
                ? "Edit Contact"
                : "Add Contact")}

            {activePage === "search" &&
              "Search Contacts"}

            {activePage === "export" &&
              "Export Contacts"}

            {activePage === "settings" &&
              "Settings"}
          </h2>
        </div>

        <div className="topbar-actions">
          <button className="icon-button">
            🔔
          </button>

          <div className="profile">
            <div className="profile-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || "Account"}
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderStats = () => {
    return (
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            ♟
          </div>

          <div>
            <span>Total Contacts</span>
            <strong>{contacts.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            ★
          </div>

          <div>
            <span>Favorites</span>
            <strong>
              {favoriteContacts.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            ▣
          </div>

          <div>
            <span>Companies</span>
            <strong>{companies.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            ⌖
          </div>

          <div>
            <span>Locations</span>
            <strong>{locations.length}</strong>
          </div>
        </div>
      </section>
    );
  };

  const renderSearchBar = () => {
    return (
      <div className="search-row">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search contacts by name, phone, email, company..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (
            <button
              onClick={() =>
                setSearchTerm("")
              }
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          ＋ Add Contact
        </button>
      </div>
    );
  };

  const renderContactCard = (contact) => {
    const fullName =
      `${contact.name || ""} ${
        contact.surname || ""
      }`.trim() || "Unnamed Contact";

    const initials =
      `${contact.name?.charAt(0) || ""}${
        contact.surname?.charAt(0) || ""
      }` || "C";

    return (
      <div
        className="contact-card"
        key={contact._id}
      >
        <div className="contact-main">
          <div className="contact-avatar">
            {initials.toUpperCase()}
          </div>

          <div className="contact-info">
            <div className="contact-name-row">
              <h3>{fullName}</h3>

              <button
                className={
                  contact.favorite
                    ? "favorite-button favorite-active"
                    : "favorite-button"
                }
                onClick={() =>
                  toggleFavorite(contact)
                }
                title="Favorite"
              >
                {contact.favorite
                  ? "★"
                  : "☆"}
              </button>
            </div>

            {contact.nickname && (
              <p className="nickname">
                "{contact.nickname}"
              </p>
            )}

            {contact.relationship && (
              <span className="relationship">
                {contact.relationship}
              </span>
            )}

            <div className="contact-details">
              {contact.phone && (
                <span>
                  📞 {contact.phone}
                </span>
              )}

              {contact.email && (
                <span>
                  ✉ {contact.email}
                </span>
              )}

              {contact.company && (
                <span>
                  ▣ {contact.company}
                </span>
              )}

              {contact.designation && (
                <span>
                  💼 {contact.designation}
                </span>
              )}

              {(contact.city ||
                contact.state) && (
                <span>
                  📍{" "}
                  {[
                    contact.city,
                    contact.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>

            {contact.tags &&
              (Array.isArray(
                contact.tags
              )
                ? contact.tags.length > 0
                : contact.tags.length > 0) && (
                <div className="tag-list">
                  {(Array.isArray(
                    contact.tags
                  )
                    ? contact.tags
                    : contact.tags.split(
                        ","
                      )
                  ).map(
                    (tag, index) => (
                      <span
                        key={index}
                        className="tag"
                      >
                        {String(tag).trim()}
                      </span>
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="contact-actions">
          <button
            className="view-button"
            onClick={() =>
              openViewContact(contact)
            }
          >
            View
          </button>

          <button
            className="edit-button"
            onClick={() =>
              openEditForm(contact)
            }
          >
            Edit
          </button>

          <button
            className="delete-button"
            onClick={() =>
              deleteContact(contact._id)
            }
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const renderContacts = (
    list = filteredContacts
  ) => {
    if (loading) {
      return (
        <div className="empty-state">
          <div className="loading-spinner"></div>

          <h3>Loading contacts...</h3>
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            ♟
          </div>

          <h3>No contacts found</h3>

          <p>
            {searchTerm
              ? "Try another search term."
              : "Add your first contact to start building your Contact Vault."}
          </p>

          {!searchTerm && (
            <button
              className="primary-button"
              onClick={openAddForm}
            >
              ＋ Add Your First Contact
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="contacts-list">
        {list.map((contact) =>
          renderContactCard(contact)
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <>
        {renderStats()}

        <div className="section-heading">
          <div>
            <h3>Recent Contacts</h3>

            <p>
              Your recently stored contacts
            </p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setActivePage("contacts")
            }
          >
            View All →
          </button>
        </div>

        {renderContacts(
          contacts.slice(0, 5)
        )}
      </>
    );
  };

  const renderContactForm = () => {
    return (
      <div className="form-container">
        <div className="form-header">
          <div>
            <h3>
              {editingContact
                ? "Edit Contact"
                : "Add New Contact"}
            </h3>

            <p>
              {editingContact
                ? "Update contact information"
                : "Fill in the details to save a new contact"}
            </p>
          </div>

          <div className="form-header-actions">
            <button
              className="secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={handleSubmit}
            >
              {editingContact
                ? "Update Contact"
                : "Save Contact"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                01
              </span>

              <div>
                <h3>Basic Information</h3>
                <p>
                  Basic personal details
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="First Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <FormField
                label="Last Name"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
              />

              <FormField
                label="Nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
              />

              <FormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={
                  formData.dateOfBirth
                }
                onChange={handleChange}
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  "Male",
                  "Female",
                  "Other",
                ]}
              />

              <FormField
                label="Relationship"
                name="relationship"
                value={
                  formData.relationship
                }
                onChange={handleChange}
                placeholder="Friend, Family, Colleague..."
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                02
              </span>

              <div>
                <h3>
                  Contact Information
                </h3>
                <p>
                  Phone numbers and email
                  addresses
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Primary Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <FormField
                label="Alternate Phone"
                name="alternatePhone"
                value={
                  formData.alternatePhone
                }
                onChange={handleChange}
              />

              <FormField
                label="WhatsApp Number"
                name="whatsappNumber"
                value={
                  formData.whatsappNumber
                }
                onChange={handleChange}
              />

              <FormField
                label="Personal Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <FormField
                label="Work / College Email"
                name="workEmail"
                type="email"
                value={
                  formData.workEmail
                }
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                03
              </span>

              <div>
                <h3>Address</h3>
                <p>
                  Complete location
                  information
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Address Line 1"
                name="addressLine1"
                value={
                  formData.addressLine1
                }
                onChange={handleChange}
                wide
              />

              <FormField
                label="Address Line 2"
                name="addressLine2"
                value={
                  formData.addressLine2
                }
                onChange={handleChange}
                wide
              />

              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <FormField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />

              <FormField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />

              <FormField
                label="PIN Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                04
              </span>

              <div>
                <h3>Professional</h3>
                <p>
                  Work and company
                  information
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />

              <FormField
                label="Designation"
                name="designation"
                value={
                  formData.designation
                }
                onChange={handleChange}
              />

              <FormField
                label="Department"
                name="department"
                value={
                  formData.department
                }
                onChange={handleChange}
              />

              <FormField
                label="Employee ID"
                name="employeeId"
                value={
                  formData.employeeId
                }
                onChange={handleChange}
              />

              <FormField
                label="Work Location"
                name="workLocation"
                value={
                  formData.workLocation
                }
                onChange={handleChange}
                wide
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                05
              </span>

              <div>
                <h3>Education</h3>
                <p>
                  Academic information
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Institution"
                name="institution"
                value={
                  formData.institution
                }
                onChange={handleChange}
              />

              <FormField
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
              />

              <FormField
                label="Register Number"
                name="registerNumber"
                value={
                  formData.registerNumber
                }
                onChange={handleChange}
              />

              <FormField
                label="Year of Study"
                name="yearOfStudy"
                value={
                  formData.yearOfStudy
                }
                onChange={handleChange}
              />

              <FormField
                label="Graduation Year"
                name="graduationYear"
                value={
                  formData.graduationYear
                }
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                06
              </span>

              <div>
                <h3>Family</h3>
                <p>
                  Parent information
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Father Name"
                name="fatherName"
                value={
                  formData.fatherName
                }
                onChange={handleChange}
              />

              <FormField
                label="Father Phone Number"
                name="fatherPhone"
                value={
                  formData.fatherPhone
                }
                onChange={handleChange}
              />

              <FormField
                label="Mother Name"
                name="motherName"
                value={
                  formData.motherName
                }
                onChange={handleChange}
              />

              <FormField
                label="Mother Phone Number"
                name="motherPhone"
                value={
                  formData.motherPhone
                }
                onChange={handleChange}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                07
              </span>

              <div>
                <h3>Online</h3>
                <p>
                  Social and professional
                  profiles
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="LinkedIn"
                name="linkedin"
                value={
                  formData.linkedin
                }
                onChange={handleChange}
                wide
                placeholder="https://linkedin.com/in/..."
              />

              <FormField
                label="GitHub"
                name="github"
                value={formData.github}
                onChange={handleChange}
                wide
                placeholder="https://github.com/..."
              />

              <FormField
                label="Personal Website"
                name="personalWebsite"
                value={
                  formData.personalWebsite
                }
                onChange={handleChange}
                wide
                placeholder="https://..."
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span className="section-number">
                08
              </span>

              <div>
                <h3>Additional</h3>
                <p>
                  Extra information and
                  organization
                </p>
              </div>
            </div>

            <div className="form-grid">
              <FormField
                label="Blood Group"
                name="bloodGroup"
                value={
                  formData.bloodGroup
                }
                onChange={handleChange}
                placeholder="O+, A+, B+, AB+..."
              />

              <FormField
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Friend, College, Work"
              />

              <div className="form-field wide">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                  rows="5"
                />
              </div>

              <label className="favorite-check">
                <input
                  type="checkbox"
                  name="favorite"
                  checked={
                    formData.favorite
                  }
                  onChange={handleChange}
                />

                <span>
                  ★ Mark as Favorite
                  Contact
                </span>
              </label>
            </div>
          </section>

          <div className="form-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              {editingContact
                ? "Update Contact"
                : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderSearchPage = () => {
    return (
      <>
        <div className="page-intro">
          <h3>Search Contacts</h3>
          <p>
            Find contacts using any
            available information.
          </p>
        </div>

        {renderSearchBar()}

        {searchTerm && (
          <div className="search-result-info">
            <strong>
              {filteredContacts.length}
            </strong>{" "}
            contacts found for{" "}
            <span>
              "{searchTerm}"
            </span>
          </div>
        )}

        {renderContacts()}
      </>
    );
  };

  const renderExportPage = () => {
    return (
      <div className="export-page">
        <div className="export-card">
          <div className="export-icon">
            📊
          </div>

          <h3>Export Contact Vault</h3>

          <p>
            Download all your contacts
            with the complete expanded
            contact information in Excel
            format.
          </p>

          <div className="export-stats">
            <div>
              <strong>
                {contacts.length}
              </strong>

              <span>Contacts</span>
            </div>

            <div>
              <strong>
                {companies.length}
              </strong>

              <span>Companies</span>
            </div>

            <div>
              <strong>
                {locations.length}
              </strong>

              <span>Locations</span>
            </div>
          </div>

          <button
            className="primary-button large"
            onClick={exportExcel}
          >
            ⇩ Export Excel
          </button>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <h3>
            Application Settings
          </h3>

          <p>
            Contact Vault configuration
            and application information.
          </p>

          <div className="setting-row">
            <div>
              <strong>
                Application
              </strong>

              <span>
                Contact Vault
              </span>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Backend API
              </strong>

              <span>
                contact-vault-api.onrender.com
              </span>
            </div>

            <span className="status-badge">
              Connected
            </span>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Database
              </strong>

              <span>MongoDB</span>
            </div>

            <span className="status-badge">
              Active
            </span>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Frontend
              </strong>

              <span>
                React + Vite
              </span>
            </div>

            <span className="status-badge">
              Active
            </span>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Account
              </strong>

              <span>
                {user?.email || "Unknown"}
              </span>
            </div>

            <span className="status-badge">
              Secure
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (
      showForm ||
      activePage === "add"
    ) {
      return renderContactForm();
    }

    if (activePage === "dashboard") {
      return renderDashboard();
    }

    if (activePage === "contacts") {
      return (
        <>
          {renderSearchBar()}

          <div className="section-heading">
            <div>
              <h3>All Contacts</h3>

              <p>
                {filteredContacts.length}{" "}
                contacts available
              </p>
            </div>
          </div>

          {renderContacts()}
        </>
      );
    }

    if (activePage === "search") {
      return renderSearchPage();
    }

    if (activePage === "export") {
      return renderExportPage();
    }

    if (activePage === "settings") {
      return renderSettings();
    }

    return renderDashboard();
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>

        <h3>
          Loading ContactVault...
        </h3>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onLogin={() =>
            setShowRegister(false)
          }
        />
      );
    }

    return (
      <Login
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  return (
    <div className="app">
      {renderSidebar()}

      <div className="main-area">
        {renderTopbar()}

        <main className="content">
          {message && (
            <div className="success-message">
              <span>✓</span>
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}

              <button
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {renderMainContent()}
        </main>
      </div>

      {showView &&
        viewingContact && (
          <div
            className="view-overlay"
            onClick={closeViewContact}
          >
            <div
              className="view-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="view-header">
                <div>
                  <h2>
                    {viewingContact.name ||
                      ""}{" "}
                    {viewingContact.surname ||
                      ""}
                  </h2>

                  <p>
                    {viewingContact.relationship ||
                      "Contact Details"}
                  </p>
                </div>

                <button
                  className="close-view"
                  onClick={
                    closeViewContact
                  }
                >
                  ×
                </button>
              </div>

              <div className="view-content">
                <ViewSection
                  title="👤 Basic Information"
                  fields={[
                    [
                      "First Name",
                      viewingContact.name,
                    ],
                    [
                      "Last Name",
                      viewingContact.surname,
                    ],
                    [
                      "Nickname",
                      viewingContact.nickname,
                    ],
                    [
                      "Date of Birth",
                      viewingContact.dateOfBirth,
                    ],
                    [
                      "Gender",
                      viewingContact.gender,
                    ],
                    [
                      "Relationship",
                      viewingContact.relationship,
                    ],
                  ]}
                />

                <ViewSection
                  title="📞 Contact Information"
                  fields={[
                    [
                      "Primary Phone",
                      viewingContact.phone,
                    ],
                    [
                      "Alternate Phone",
                      viewingContact.alternatePhone,
                    ],
                    [
                      "WhatsApp Number",
                      viewingContact.whatsappNumber,
                    ],
                    [
                      "Personal Email",
                      viewingContact.email,
                    ],
                    [
                      "Work / College Email",
                      viewingContact.workEmail,
                    ],
                  ]}
                />

                <ViewSection
                  title="🏠 Address"
                  fields={[
                    [
                      "Address Line 1",
                      viewingContact.addressLine1,
                    ],
                    [
                      "Address Line 2",
                      viewingContact.addressLine2,
                    ],
                    [
                      "City",
                      viewingContact.city,
                    ],
                    [
                      "State",
                      viewingContact.state,
                    ],
                    [
                      "Country",
                      viewingContact.country,
                    ],
                    [
                      "PIN Code",
                      viewingContact.pinCode,
                    ],
                  ]}
                />

                <ViewSection
                  title="💼 Professional"
                  fields={[
                    [
                      "Company",
                      viewingContact.company,
                    ],
                    [
                      "Designation",
                      viewingContact.designation,
                    ],
                    [
                      "Department",
                      viewingContact.department,
                    ],
                    [
                      "Employee ID",
                      viewingContact.employeeId,
                    ],
                    [
                      "Work Location",
                      viewingContact.workLocation,
                    ],
                  ]}
                />

                <ViewSection
                  title="🎓 Education"
                  fields={[
                    [
                      "Institution",
                      viewingContact.institution,
                    ],
                    [
                      "Course",
                      viewingContact.course,
                    ],
                    [
                      "Register Number",
                      viewingContact.registerNumber,
                    ],
                    [
                      "Year of Study",
                      viewingContact.yearOfStudy,
                    ],
                    [
                      "Graduation Year",
                      viewingContact.graduationYear,
                    ],
                  ]}
                />

                <ViewSection
                  title="👨‍👩‍👦 Family"
                  fields={[
                    [
                      "Father Name",
                      viewingContact.fatherName,
                    ],
                    [
                      "Father Phone Number",
                      viewingContact.fatherPhone,
                    ],
                    [
                      "Mother Name",
                      viewingContact.motherName,
                    ],
                    [
                      "Mother Phone Number",
                      viewingContact.motherPhone,
                    ],
                  ]}
                />

                <ViewSection
                  title="🌐 Online"
                  fields={[
                    [
                      "LinkedIn",
                      viewingContact.linkedin,
                    ],
                    [
                      "GitHub",
                      viewingContact.github,
                    ],
                    [
                      "Personal Website",
                      viewingContact.personalWebsite,
                    ],
                  ]}
                />

                <ViewSection
                  title="📝 Additional"
                  fields={[
                    [
                      "Blood Group",
                      viewingContact.bloodGroup,
                    ],
                    [
                      "Tags",
                      Array.isArray(
                        viewingContact.tags
                      )
                        ? viewingContact.tags.join(
                            ", "
                          )
                        : viewingContact.tags,
                    ],
                    [
                      "Favorite",
                      viewingContact.favorite
                        ? "★ Yes"
                        : "☆ No",
                    ],
                  ]}
                />

                <div className="view-section">
                  <h3>📝 Notes</h3>

                  <div className="view-field full">
                    <p>
                      {viewingContact.notes ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="view-footer">
                <button
                  className="secondary-button"
                  onClick={
                    closeViewContact
                  }
                >
                  Close
                </button>

                <button
                  className="primary-button"
                  onClick={() => {
                    closeViewContact();
                    openEditForm(
                      viewingContact
                    );
                  }}
                >
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function ViewSection({
  title,
  fields,
}) {
  return (
    <div className="view-section">
      <h3>{title}</h3>

      <div className="view-grid">
        {fields.map(
          ([label, value]) => (
            <div
              className="view-field"
              key={label}
            >
              <label>{label}</label>

              <p>
                {value || "—"}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  wide = false,
  placeholder = "",
}) {
  return (
    <div
      className={
        wide
          ? "form-field wide"
          : "form-field"
      }
    >
      <label>
        {label}

        {required && (
          <span className="required">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            value={option}
            key={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default App;