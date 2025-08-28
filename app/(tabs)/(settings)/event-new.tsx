import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function EventNew() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // ISO string or yyyy-mm-ddThh:mm (optional)
  const [location, setLocation] = useState(''); // optional
  const [organizer, setOrganizer] = useState(''); // optional
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('userId');
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setUserId(parsed?.id ?? parsed?._id ?? String(parsed) ?? '');
      } catch {
        setUserId(raw);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Everything is optional now
      const body = {
        title,
        description,
        date,          // optioneel, ISO string
        location,
        organizerName: organizer,
        imageUrl,
        ownerId: userId,
      };

      await api.post('/events', body);
      Alert.alert('Event toegevoegd', 'Je event is aangemaakt.');
      router.replace('/my-events');
    } catch (e: any) {
      Alert.alert('Fout', e?.message || 'Kon event niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.box}>
        <Text style={styles.h1}>Nieuw event</Text>

        <Text style={styles.label}>Titel</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titel…" />

        <Text style={styles.label}>Datum</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2025-08-27T20:00"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Locatie</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Bijv. Antwerpen, België"
        />

        <Text style={styles.label}>Organisatie</Text>
        <TextInput
          style={styles.input}
          value={organizer}
          onChangeText={setOrganizer}
          placeholder="Organisator/Organisatie"
        />

        <Text style={styles.label}>Afbeelding URL</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          autoCapitalize="none"
        />

        <Text style={styles.label}>Beschrijving</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Details…"
          multiline
        />

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving}>
          <Text style={styles.btnLabel}>{saving ? 'Bezig…' : 'Opslaan'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  box: { padding: 16 },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  label: { fontWeight: '700', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnLabel: { color: '#fff', fontWeight: '700' },
});