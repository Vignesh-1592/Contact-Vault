import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const API_URL = "https://contact-vault-api.onrender.com/api";

type User = {
  name: string;
  email: string;
};

type Contact = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
};

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token =
        await SecureStore.getItemAsync(
          "contactVaultToken"
        );

      const savedUser =
        await SecureStore.getItemAsync(
          "contactVaultUser"
        );

      if (!token) {
        router.replace("/login");
        return;
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const response = await fetch(
        `${API_URL}/contacts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await SecureStore.deleteItemAsync(
            "contactVaultToken"
          );

          await SecureStore.deleteItemAsync(
            "contactVaultUser"
          );

          router.replace("/login");
          return;
        }

        throw new Error("Unable to load contacts");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setContacts(data);
      } else if (Array.isArray(data.contacts)) {
        setContacts(data.contacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from Contact Vault?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(
              "contactVaultToken"
            );

            await SecureStore.deleteItemAsync(
              "contactVaultUser"
            );

            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleAddContact = () => {
    Alert.alert(
      "Add Contact",
      "The Add Contact screen will be added next."
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#315FE8"
        />

        <Text style={styles.loadingText}>
          Loading your vault...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>
            CONTACT MANAGEMENT
          </Text>

          <Text style={styles.headerTitle}>
            Dashboard
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeLabel}>
            Welcome back,
          </Text>

          <Text style={styles.welcomeName}>
            {user?.name || "User"}
          </Text>

          <Text style={styles.welcomeEmail}>
            {user?.email || ""}
          </Text>
        </View>

        <View style={styles.statsRow}>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {contacts.length}
            </Text>

            <Text style={styles.statLabel}>
              Total Contacts
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {contacts.filter(
                (contact) => contact.phone
              ).length}
            </Text>

            <Text style={styles.statLabel}>
              With Phone
            </Text>
          </View>

        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Contacts
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your saved contacts
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddContact}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              👤
            </Text>

            <Text style={styles.emptyTitle}>
              No contacts yet
            </Text>

            <Text style={styles.emptyText}>
              Start building your private contact
              vault by adding your first contact.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddContact}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>
                Add Your First Contact
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contactsContainer}>
            {contacts.slice(0, 5).map((contact) => (
              <View
                key={contact._id}
                style={styles.contactCard}
              >
                <View style={styles.contactAvatar}>
                  <Text
                    style={styles.contactAvatarText}
                  >
                    {contact.name
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <Text
                    style={styles.contactName}
                    numberOfLines={1}
                  >
                    {contact.name}
                  </Text>

                  {contact.phone ? (
                    <Text
                      style={styles.contactDetail}
                    >
                      📞 {contact.phone}
                    </Text>
                  ) : contact.email ? (
                    <Text
                      style={styles.contactDetail}
                      numberOfLines={1}
                    >
                      ✉️ {contact.email}
                    </Text>
                  ) : (
                    <Text
                      style={styles.contactDetail}
                    >
                      No contact details
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>
            ↪
          </Text>

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
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
    color: "#667085",
    fontSize: 14,
  },

  header: {
    height: 82,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
  },

  smallTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#315FE8",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#101828",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5EDFF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#315FE8",
    fontSize: 18,
    fontWeight: "800",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },

  welcomeCard: {
    backgroundColor: "#315FE8",
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,

    shadowColor: "#315FE8",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  welcomeLabel: {
    color: "#DCE6FF",
    fontSize: 14,
    marginBottom: 4,
  },

  welcomeName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  welcomeEmail: {
    color: "#DCE6FF",
    fontSize: 13,
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECF0",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#315FE8",
  },

  statLabel: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#101828",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#667085",
    marginTop: 3,
  },

  addButton: {
    backgroundColor: "#315FE8",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#315FE8",
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  contactsContainer: {
    gap: 10,
  },

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },

  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E5EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  contactAvatarText: {
    color: "#315FE8",
    fontSize: 18,
    fontWeight: "800",
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 5,
  },

  contactDetail: {
    fontSize: 12,
    color: "#667085",
  },

  logoutButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F04438",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 28,
    gap: 8,
  },

  logoutIcon: {
    color: "#F04438",
    fontSize: 20,
  },

  logoutText: {
    color: "#F04438",
    fontSize: 15,
    fontWeight: "700",
  },
});