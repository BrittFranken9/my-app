import React, { useEffect, useState, useCallback } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';

export default function EventEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const e: any = await api.get(`/events/${id}`, undefined, 20000, 1);
      setTitle(e.title ?? e.name ?? e.teaser ?? '');
      setDate(e.date ?? e.startDate ?? '');
      setLocation(e.location ?? '');
      setOrganizerName(e.organizerName ?? e.organizationName ?? '');
      setImageUrl(e.imageUrl ?? e.cover ?? '');
      setDescription(e.teaser ?? e.description ?? '');
    } catch (e: any) {
      Alert.alert('Fout', e?.message || 'Kon event niet laden.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body = {
        title,
        date,
        location,
        organizerName,
        imageUrl,
        teaser: description,
      };
      await api.patch(`/events/${id}`, body);
      Alert.alert('Opgeslagen', 'Wijzigingen zijn bewaard.');
      router.back();
    } catch (e: any) {
      Alert.alert('Fout', e?.message || 'Kon niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.box}><Text style={styles.h1}>Laden…</Text></ScrollView></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.box}>
        <Text style={styles.h1}>Event wijzigen</Text>

        <Text style={styles.label}>Titel</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titel…" />

        <Text style={styles.label}>Datum</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-09-01T20:00" />

        <Text style={styles.label}>Locatie</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Locatie…" />

        <Text style={styles.label}>Organisatie</Text>
        <TextInput style={styles.input} value={organizerName} onChangeText={setOrganizerName} placeholder="Organisatie…" />

        <Text style={styles.label}>Afbeelding URL</Text>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />

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
