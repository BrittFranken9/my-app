import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/constants/Api';

type EventDto = {
  _id: string;
  organizerName: string;
  organizationName?: string;
  date: string; // ISO
  imageUrl: string;
  teaser: string;
  location: string;
  ticketsUrl?: string;
  websiteUrl?: string;
  keywordsRaw?: string;
  likesCount?: number;
  goingCount?: number;
};

type Params = {
  eventId?: string | string[];
  userId?: string | string[];
};

export default function DetailsScreen() {
  const params = useLocalSearchParams<Params>();
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>('');

  const [liked, setLiked] = useState<boolean>(false);
  const [going, setGoing] = useState<boolean>(false);
  const [busyLike, setBusyLike] = useState<boolean>(false);
  const [busyGoing, setBusyGoing] = useState<boolean>(false);

  const base = API_URL?.replace(/\/+$/, '') || '';

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${base}/events/${eventId}`);
      if (!res.ok) throw new Error('Failed to load event');
      const data: EventDto = await res.json();
      setEvent(data);
      setErr('');
    } catch (e: any) {
      setErr(e?.message ?? 'Error loading event');
    } finally {
      setLoading(false);
    }
  }, [base, eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const keywords = useMemo(() => {
    if (!event?.keywordsRaw) return [];
    return event.keywordsRaw
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);
  }, [event]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    try {
      return new Intl.DateTimeFormat('nl-BE', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(event.date));
    } catch {
      return '';
    }
  }, [event?.date]);

  async function toggleStatus(type: 'like' | 'going', on: boolean) {
    if (!userId || !eventId) {
      Alert.alert('Login required', 'Missing userId or eventId.');
      return;
    }
    const setBusy = type === 'like' ? setBusyLike : setBusyGoing;
    const setFlag = type === 'like' ? setLiked : setGoing;
    const incField = type === 'like' ? 'likesCount' : 'goingCount';

    try {
      setBusy(true);
      const res = await fetch(`${base}/events/${eventId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, on }),
      });
      if (!res.ok) {
        const msg = (await res.json())?.error || 'Failed to update';
        throw new Error(msg);
      }
      setFlag(on);
      setEvent(prev =>
        prev ? { ...prev, [incField]: Math.max(0, (prev[incField as keyof EventDto] as number ?? 0) + (on ? 1 : -1)) } : prev
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading event…</Text>
      </View>
    );
  }

  if (err || !event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{err || 'Event not found.'}</Text>
        <Pressable style={styles.button} onPress={fetchEvent}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!!event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.cover} />}

      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={3}>
          {event.teaser || 'Event'}
        </Text>
        <Text style={styles.subtitle}>
          Organizer: {event.organizerName}
          {event.organizationName ? ` (${event.organizationName})` : ''}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaLine}>
          <Text style={styles.metaLabel}>When: </Text>
          {formattedDate || '-'}
        </Text>
        <Text style={styles.metaLine}>
          <Text style={styles.metaLabel}>Where: </Text>
          {event.location || '-'}
        </Text>
      </View>

      {keywords.length > 0 && (
        <View style={styles.chipsWrap}>
          {keywords.map((k, i) => (
            <View style={styles.chip} key={`${k}-${i}`}>
              <Text style={styles.chipText}>{k}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <Pressable
          disabled={busyLike}
          onPress={() => toggleStatus('like', !liked)}
          style={[styles.pillBtn, liked && styles.pillBtnActive]}
        >
          <Text style={[styles.pillText, liked && styles.pillTextActive]}>
            ♥ Like {Math.max(0, (event.likesCount ?? 0) + (liked ? 1 : 0))}
          </Text>
        </Pressable>

        <Pressable
          disabled={busyGoing}
          onPress={() => toggleStatus('going', !going)}
          style={[styles.pillBtn, going && styles.pillBtnActive]}
        >
          <Text style={[styles.pillText, going && styles.pillTextActive]}>
            ✓ Going {Math.max(0, (event.goingCount ?? 0) + (going ? 1 : 0))}
          </Text>
        </Pressable>
      </View>

      <View style={styles.linksRow}>
        {!!event.ticketsUrl && (
          <Pressable style={styles.buttonSecondary} onPress={() => Linking.openURL(event.ticketsUrl!)}>
            <Text style={styles.buttonText}>Buy Tickets</Text>
          </Pressable>
        )}
        {!!event.websiteUrl && (
          <Pressable style={styles.buttonSecondary} onPress={() => Linking.openURL(event.websiteUrl!)}>
            <Text style={styles.buttonText}>Website</Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { marginTop: 8, color: '#666' },
  error: { color: '#c0392b', marginBottom: 12, fontSize: 16, textAlign: 'center' },
  cover: { width: '100%', height: 240, backgroundColor: '#eee' },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 6, color: '#666' },
  meta: { paddingHorizontal: 16, paddingTop: 12 },
  metaLine: { fontSize: 15, marginTop: 6 },
  metaLabel: { color: '#666' },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 13, color: '#333' },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pillBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  pillBtnActive: { backgroundColor: '#111' },
  pillText: { fontSize: 15, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  linksRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  button: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
