import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API_URL = "https://contact-vault-api.onrender.com/api";

type Contact = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  favorite?: boolean;
};

export default function ContactsScreen() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = async () => {
    try {
      const token = await SecureStore.getItemAsync(
        "contactVaultToken"
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/contacts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch contacts"
        );
      }

      setContacts(data.contacts || []);
    } catch (error: any) {
      Alert.alert(
        "Unable to Load",
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  const toggleFavorite = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync(
        "contactVaultToken"
      );

      const response = await fetch(
        `${API_URL}/contacts/${id}/favorite`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update favorite"
        );
      }

      setContacts((current) =>
        current.map((contact) =>
          contact._id === id
            ? {
                ...contact,
                favorite: data.contact.favorite,
              }
            : contact
        )
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Unable to update favorite"
      );
    }
  };

  const deleteContact = (id: string, name: string) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token =
                await SecureStore.getItemAsync(
                  "contactVaultToken"
                );

              const response = await fetch(
                `${API_URL}/contacts/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message ||
                    "Unable to delete contact"
                );
              }

              setContacts((current) =>
                current.filter(
                  (contact) => contact._id !== id
                )
              );

              Alert.alert(
                "Deleted",
                "Contact deleted successfully."
              );
            } catch (error: any) {
              Alert.alert(
                "Delete Failed",
                error.message ||
                  "Unable to delete contact"
              );
            }
          },
        },
      ]
    );
  };

  const renderContact = ({
    item,
  }: {
    item: Contact;
  }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name}
        </Text>

        {item.phone ? (
          <Text style={styles.detail}>
            📞 {item.phone}
          </Text>
        ) : null}

        {item.email ? (
          <Text style={styles.detail}>
            ✉️ {item.email}
          </Text>
        ) : null}

        {item.company ? (
          <Text style={styles.detail}>
            🏢 {item.company}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            toggleFavorite(item._id)
          }
          style={styles.iconButton}
        >
          <Text
            style={[
              styles.star,
              item.favorite && styles.activeStar,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/edit-contact",
              params: { id: item._id },
            })
          }
          style={styles.iconButton}
        >
          <Text style={styles.edit}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            deleteContact(
              item._id,
              item.name
            )
          }
          style={styles.iconButton}
        >
          <Text style={styles.delete}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#315DEB"
        />
        <Text style={styles.loadingText}>
          Loading contacts...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            My Contacts
          </Text>

          <Text style={styles.subtitle}>
            {contacts.length}{" "}
            {contacts.length === 1
              ? "contact"
              : "contacts"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push("/add-contact")
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            👤
          </Text>

          <Text style={styles.emptyTitle}>
            No contacts yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first contact to get started.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              router.push("/add-contact")
            }
          >
            <Text style={styles.emptyButtonText}>
              Add Contact
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchContacts();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  addButton: {
    backgroundColor: "#315DEB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#315DEB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  detail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  actions: {
    alignItems: "flex-end",
    gap: 5,
  },

  iconButton: {
    paddingVertical: 2,
    paddingHorizontal: 3,
  },

  star: {
    fontSize: 20,
    color: "#CBD5E1",
  },

  activeStar: {
    color: "#F59E0B",
  },

  edit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#315DEB",
  },

  delete: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FF",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
  },

  emptyButton: {
    marginTop: 25,
    backgroundColor: "#315DEB",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});