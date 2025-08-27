// app/(tabs)/settings/index.tsx
import { SafeAreaView, StyleSheet, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback } from "react";


export default function SettingsHome() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.clear(); // remove all saved keys (userId, etc.)
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/"); // go back to root/login screen
    } catch (e) {
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.h1}>Settings</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/profile')}>
          <Text style={styles.btnLabel}>Profielnaam aanpassen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/my-events')}>
          <Text style={styles.btnLabel}>Mijn events beheren</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutLabel}>Log Out</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  box: { padding: 16 },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  btn: { marginTop: 10, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  btnLabel: { color: '#fff', fontWeight: '700' },
    logoutButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
    container: {
    flex: 1,
    backgroundColor: "#0B1220",
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 32,
    color: "#F9FAFB",
    textAlign: "center",
  },
});
