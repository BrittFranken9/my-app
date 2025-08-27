import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/constants/Api';

type EventItem = {
  _id: string;
  teaser: string;
  imageUrl?: string;
  location?: string;
  date?: string;
  likesCount?: number;
  goingCount?: number;
};

type MineResponse = {
  items: EventItem[];
  total: number;
  page: number;
  pages: number;
};

type Params = { userId?: string | string[] };

export default function ArchiveGoingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const base = (API_URL || '').replace(/\/+$/, '');
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${base}/events/mine/list?userId=${encodeURIComponent(userId)}&status=going&page=1&limit=100`);
      if (!res.ok) throw new Error('Failed to load going events');
      const data: MineResponse = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setErr('');
    } catch (e: any) {
      setErr(e?.message ?? 'Error loading going events');
    } finally {
      setLoading(false);
    }
  }, [base, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderItem = ({ item }: { item: EventItem }) => {
    const formattedDate = item.date
      ? new Intl.DateTimeFormat('nl-BE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.date))
      : '';
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/(home)/details',
            params: { eventId: item._id, userId },
          })
        }
      >
        {!!item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.thumb} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.teaser || 'Event'}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {item.location || '-'} • {formattedDate}
          </Text>
          <Text style={styles.cardCounts}>
            ♥ {item.likesCount ?? 0}   •   ✓ {item.goingCount ?? 0}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading your “going” events…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {err ? <Text style={styles.error}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.muted}>No upcoming events yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  list: { padding: 12 },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#c0392b', padding: 12 },
  muted: { marginTop: 8, color: '#666' },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { marginTop: 4, color: '#666' },
  cardCounts: { marginTop: 6, fontWeight: '600' },
});
