import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import React, { useEffect } from "react";
import { API_URL } from "@/constants/Api";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Link } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        router.replace("/(tabs)/(home)");
      }
    };
    checkLogin();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const authUrl = `${API_URL}/auth/google`;
      const redirectURL = AuthSession.makeRedirectUri();

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectURL);

      if (result.type === "success" && result.url) {
        const params = new URL(result.url).searchParams;
        const user = params.get("user");

        if (user) {
          await AsyncStorage.setItem("userId", user);
          router.replace("/(tabs)/(home)");
        }
      } else {
        Alert.alert("Authentication canceled or failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to authenticate with Google");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.center}>
          <ThemedText type="title" style={styles.title}>
            Welcome
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to continue with your events
          </ThemedText>

          <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
            <ThemedText style={styles.loginLabel}>Sign in with Google</ThemedText>
          </TouchableOpacity>

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0B1220" },
  container: { flexGrow: 1, justifyContent: "center", padding: 16 },
  center: { alignItems: "center", justifyContent: "center", gap: 20 },

  title: { fontSize: 28, fontWeight: "800", color: "#F9FAFB" },
  subtitle: { fontSize: 16, color: "#CBD5E1", marginTop: 4, marginBottom: 20 },

  loginButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  loginLabel: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  link: { color: "#9CA3AF", marginTop: 8 },
});
