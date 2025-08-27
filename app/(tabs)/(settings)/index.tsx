// app/(tabs)/settings/index.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsHome() {
  const router = useRouter();
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
});
