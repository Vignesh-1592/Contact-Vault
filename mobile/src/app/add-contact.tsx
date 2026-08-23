import { useState } from "react";
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
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://contact-vault-api.onrender.com/api";

export default function AddContactScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateContact = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter the contact name.");
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync(
        "contactVaultToken"
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create contact"
        );
      }

      Alert.alert(
        "Contact Created",
        "Contact created successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/contacts"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to Create Contact",
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Add Contact
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>+</Text>
        </View>

        <Text style={styles.title}>
          Create New Contact
        </Text>

        <Text style={styles.subtitle}>
          Add contact details to your private vault.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>
            Full Name *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor="#98A2B3"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#98A2B3"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#98A2B3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Company
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            placeholderTextColor="#98A2B3"
            value={company}
            onChangeText={setCompany}
          />

          <Text style={styles.label}>
            Job Title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter job title"
            placeholderTextColor="#98A2B3"
            value={jobTitle}
            onChangeText={setJobTitle}
          />

          <Text style={styles.label}>
            Tags
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: friend, college, work"
            placeholderTextColor="#98A2B3"
            value={tags}
            onChangeText={setTags}
          />

          <Text style={styles.helper}>
            Separate multiple tags with commas.
          </Text>

          <TouchableOpacity
            style={[
              styles.createButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreateContact}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.createButtonText}>
                Create Contact
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
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

  header: {
    height: 82,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 38,
    color: "#101828",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#101828",
  },

  headerSpace: {
    width: 44,
  },

  content: {
    padding: 22,
    paddingBottom: 40,
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#E5EDFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },

  icon: {
    color: "#315FE8",
    fontSize: 38,
    fontWeight: "400",
  },

  title: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "800",
    color: "#101828",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#667085",
    marginTop: 7,
    marginBottom: 28,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
    marginBottom: 7,
    marginTop: 13,
  },

  input: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#101828",
  },

  helper: {
    fontSize: 11,
    color: "#98A2B3",
    marginTop: 6,
  },

  createButton: {
    height: 54,
    backgroundColor: "#315FE8",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.7,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#667085",
    fontSize: 15,
    fontWeight: "600",
  },
});