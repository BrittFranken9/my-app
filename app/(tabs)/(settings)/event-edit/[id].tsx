import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EventEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userId, setUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('userId');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setUserId(parsed?.id ?? parsed?._id ?? String(parsed) ?? '');
        } catch {
          setUserId(raw);
        }
      }
      if (!id) return setLoading(false);
      try {
        const data = await api.get<any>(`/events/${id}`);
        const e = Array.isArray(data) ? data[0] : data?.data ?? data;
        setTitle(e?.title ?? e?.name ?? '');
        setDate(e?.date ?? e?.startDate ?? '');
        setImageUrl(e?.imageUrl ?? e?.cover ?? e?.banner ?? '');
        setDescription(e?.description ?? e?.details ?? '');
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      const body = { title, description, date, imageUrl, ownerId: userId };
      await api.put(`/events/${id}`, body); // adjust to PATCH if your API uses PATCH
      Alert.alert('Opgeslagen', 'Event is bijgewerkt.');
      router.replace('/my-events');
    } catch (e:any) {
      Alert.alert('Fout', e?.message || 'Kon event niet opslaan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.box}>
        <Text style={styles.h1}>Event bewerken</Text>

        <Text style={styles.label}>Titel</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} editable={!loading} />

        <Text style={styles.label}>Datum/tijd</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} editable={!loading} placeholder="2025-08-27T20:00" />

        <Text style={styles.label}>Afbeelding URL</Text>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} editable={!loading} placeholder="https://..." />

        <Text style={styles.label}>Beschrijving</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          editable={!loading}
          multiline
        />

        <TouchableOpacity style={styles.btn} onPress={save} disabled={saving || loading || !title.trim()}>
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
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  btn: { marginTop: 16, backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnLabel: { color: '#fff', fontWeight: '700' },
});
