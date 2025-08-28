import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventActions from '@/components/EventActions';

type Event = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  imageUrl?: string;
  likeCount?: number;
  goingCount?: number;
  likedBy?: string[];
  goingBy?: string[];
};

export default function DetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userId');
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          setUserId(parsed?.id ?? parsed?._id ?? String(parsed) ?? '');
        } catch {
          setUserId(raw);
        }
      } catch {}
    })();
  }, []);

  const load = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<any>(`/events/${eventId}`, undefined, 25000, 1);
      const e = Array.isArray(data) ? data[0] : data?.data ?? data;
      const mapped: Event = {
        _id: e._id ?? e.id ?? eventId,
        title: e.title ?? e.name ?? 'Zonder titel',
        description: e.description ?? e.details ?? '',
        date: e.date ?? e.startDate ?? e.startsAt ?? e.createdAt,
        startDate: e.startDate,
        imageUrl: e.imageUrl ?? e.cover ?? e.banner,
        likeCount: e.likeCount ?? e.likes ?? (Array.isArray(e.likedBy) ? e.likedBy.length : 0) ?? 0,
        goingCount: e.goingCount ?? e.going ?? e.attending ?? (Array.isArray(e.goingBy) ? e.goingBy.length : 0) ?? 0,
        likedBy: e.likedBy,
        goingBy: e.goingBy,
      };
      setEvent(mapped);
    } catch (err: any) {
      setError(err?.message || 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Even geduld…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.h1}>Er ging iets mis</Text>
          <Text style={styles.muted}>{error ?? 'Event niet gevonden'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const liked = !!(userId && Array.isArray(event.likedBy) && event.likedBy.includes(userId));
  const going = !!(userId && Array.isArray(event.goingBy) && event.goingBy.includes(userId));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: event.imageUrl ?? 'https://via.placeholder.com/1200x630?text=Event' }}
          style={styles.hero}
        />
        <Text style={styles.h1}>{event.title}</Text>
        {!!(event.date || event.startDate) && (
          <Text style={styles.meta}>{new Date(event.date ?? event.startDate!).toLocaleString('nl-BE')}</Text>
        )}
        <EventActions
          eventId={event._id}
          userId={userId}
          liked={liked}
          going={going}
          likeCount={event.likeCount ?? 0}
          goingCount={event.goingCount ?? 0}
          onChanged={(next) => {
            setEvent(e => e ? {
              ...e,
              likeCount: next.likeCount,
              goingCount: next.goingCount,
              likedBy: updateSet(e.likedBy, userId, next.liked),
              goingBy: updateSet(e.goingBy, userId, next.going),
            } : e);
          }}
        />
        {!!event.description && <Text style={styles.body}>{event.description}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function updateSet(arr: string[]|undefined, id: string, include: boolean) {
  const set = new Set(arr ?? []);
  if (include) set.add(id); else set.delete(id);
  return Array.from(set);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  hero: { width: '100%', height: 260, backgroundColor: '#1f2937' },
  h1: { fontSize: 26, fontWeight: '900', paddingHorizontal: 16, marginTop: 12, color: '#f9fafb' },
  meta: { paddingHorizontal: 16, marginTop: 6, color: '#cbd5e1' },
  body: { paddingHorizontal: 16, marginTop: 14, fontSize: 16, lineHeight: 22, color: '#e5e7eb' },
  muted: { color: '#9ca3af' },
});