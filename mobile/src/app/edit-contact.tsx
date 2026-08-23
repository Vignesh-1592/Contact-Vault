import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://10.0.2.2:5000";

export default function EditContactScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!id) {
      Alert.alert("Error", "Contact ID is missing.");
      router.back();
      return;
    }

    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Error",
          data.message || "Unable to load contact."
        );
        router.back();
        return;
      }

      const contact = data.contact;

      setName(contact.name || "");
      setPhone(contact.phone || "");
      setEmail(contact.email || "");
      setCompany(contact.company || "");
      setJobTitle(contact.jobTitle || "");

      if (Array.isArray(contact.tags)) {
        setTags(contact.tags.join(", "));
      } else {
        setTags(contact.tags || "");
      }
    } catch (error) {
      console.error("Load contact error:", error);

      Alert.alert(
        "Error",
        "Unable to load contact. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the contact name.");
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          tags: tags.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Update Failed",
          data.message || "Unable to update contact."
        );
        return;
      }

      Alert.alert(
        "Contact Updated",
        "Contact updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Update contact error:", error);

      Alert.alert(
        "Error",
        "Unable to update contact. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteContact,
        },
      ]
    );
  };

  const deleteContact = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Delete Failed",
          data.message || "Unable to delete contact."
        );
        return;
      }

      Alert.alert(
        "Contact Deleted",
        "Contact deleted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    } catch (error) {
      console.error("Delete contact error:", error);

      Alert.alert(
        "Error",
        "Unable to delete contact. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#315DEB" />
        <Text style={styles.loadingText}>Loading contact...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Contact</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Edit Contact</Text>

        <Text style={styles.subtitle}>
          Update your contact details.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Phone Number</Text>

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Company</Text>

          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            placeholder="Enter company name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Job Title</Text>

          <TextInput
            style={styles.input}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="Enter job title"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Tags</Text>

          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="Example: friend, college, work"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.helper}>
            Separate multiple tags with commas.
          </Text>

          <TouchableOpacity
            style={[
              styles.updateButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>
              Delete Contact
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748B",
  },

  header: {
    height: 70,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backButton: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 38,
    color: "#111827",
    lineHeight: 40,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  headerSpace: {
    width: 45,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 17,
    fontSize: 16,
    color: "#111827",
  },

  helper: {
    marginTop: 8,
    fontSize: 12,
    color: "#94A3B8",
  },

  updateButton: {
    height: 58,
    marginTop: 32,
    borderRadius: 14,
    backgroundColor: "#315DEB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  deleteButton: {
    height: 58,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
});