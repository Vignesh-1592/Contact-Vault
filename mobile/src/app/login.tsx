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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
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
        "Login Successful",
        `Welcome back, ${data.user.name}!`,
        [
          {
            text: "Continue",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again."
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
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Sign in to access your Contact Vault
          </Text>

          <View style={styles.form}>

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
                placeholder="Enter your password"
                placeholderTextColor="#98A2B3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

          </View>

          <View style={styles.registerSection}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/register")
              }
            >
              <Text style={styles.registerLink}>
                Create an account
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
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: "#315FE8",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,

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
    fontSize: 30,
    fontWeight: "800",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#101828",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    marginBottom: 32,
  },

  form: {
    width: "100%",
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#101828",
  },

  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#315FE8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,

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

  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 5,
  },

  registerText: {
    color: "#667085",
    fontSize: 14,
  },

  registerLink: {
    color: "#315FE8",
    fontSize: 14,
    fontWeight: "700",
  },

  secureMessage: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  secureIcon: {
    fontSize: 15,
    marginRight: 6,
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