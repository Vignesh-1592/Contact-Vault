import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    console.log("Get Started pressed");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <View style={styles.logo}>
          <Text style={styles.logoText}>CV</Text>
        </View>

        <Text style={styles.title}>
          Contact Vault
        </Text>

        <Text style={styles.subtitle}>
          Your private contact management
        </Text>

        <Text style={styles.description}>
          Securely store, manage and access your
          {"\n"}
          contacts anytime, anywhere.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <Text style={styles.security}>
          🔒 Your contacts are private and secure
        </Text>

        <Text style={styles.copyright}>
          © 2026 Contact Vault
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 125,
    height: 125,
    borderRadius: 30,
    backgroundColor: "#315DEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,

    shadowColor: "#315DEB",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 15,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#315DEB",
    marginBottom: 20,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    lineHeight: 27,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
  },

  button: {
    width: "100%",
    height: 62,
    backgroundColor: "#315DEB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",

    elevation: 6,

    shadowColor: "#315DEB",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  security: {
    marginTop: 35,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  copyright: {
    position: "absolute",
    bottom: 35,
    fontSize: 13,
    color: "#94A3B8",
  },
});