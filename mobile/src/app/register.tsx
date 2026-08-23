import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const API_URL = "https://contact-vault-api.onrender.com/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in all fields."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      await SecureStore.setItemAsync(
        "contactVaultToken",
        data.token
      );

      await SecureStore.setItemAsync(
        "contactVaultUser",
        JSON.stringify(data.user)
      );

      Alert.alert(
        "Account Created Successfully",
        `Welcome to Contact Vault, ${data.user.name}!`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/dashboard");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.content}>

          <View style={styles.logo}>
            <Text style={styles.logoText}>CV</Text>
          </View>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Create your private Contact Vault account
          </Text>

          <View style={styles.form}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#98A2B3"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email address
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#98A2B3"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#98A2B3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm password
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#98A2B3"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

          </View>

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.loginLink}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secureMessage}>
            <Text style={styles.secureIcon}>
              🔒
            </Text>

            <Text style={styles.secureText}>
              Your contacts are private and secure
            </Text>
          </View>

        </View>

        <Text style={styles.footer}>
          © 2026 Contact Vault
        </Text>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#315FE8",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,

    shadowColor: "#315FE8",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#101828",
    textAlign: "center",
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
    marginBottom: 24,
  },

  form: {
    width: "100%",
  },

  inputGroup: {
    marginBottom: 13,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#101828",
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#315FE8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,

    shadowColor: "#315FE8",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 5,
  },

  loginText: {
    color: "#667085",
    fontSize: 14,
  },

  loginLink: {
    color: "#315FE8",
    fontSize: 14,
    fontWeight: "700",
  },

  secureMessage: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  secureIcon: {
    fontSize: 14,
    marginRight: 5,
  },

  secureText: {
    color: "#667085",
    fontSize: 12,
  },

  footer: {
    textAlign: "center",
    color: "#98A2B3",
    fontSize: 12,
    paddingBottom: 16,
  },
});