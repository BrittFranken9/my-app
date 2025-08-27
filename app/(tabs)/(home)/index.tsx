import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import EventActions from '@/components/EventActions';

type EventItem = {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  imageUrl?: string;
  likeCount?: number;
  goingCount?: number;
  likedBy?: string[];     // if your API returns these
  goingBy?: string[];     // if your API returns these
};

function pickArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  const nested = data?.data;
  if (Array.isArray(nested?.items)) return nested.items;
  if (Array.isArray(nested?.results)) return nested.results;
  if (Array.isArray(nested?.docs)) return nested.docs;
  return [];
}

function normalize(list: any[]): EventItem[] {
  return list.map((it: any) => {
    const id = it._id ?? it.id ?? it.uuid ?? it.eventId ?? String(it?.id ?? '');
    return {
      _id: id,
      id: it.id,
      title: it.title ?? it.name ?? 'Zonder titel',
      description: it.description ?? it.details ?? '',
      date: it.date ?? it.startDate ?? it.startsAt ?? it.createdAt,
      startDate: it.startDate,
      imageUrl: it.imageUrl ?? it.cover ?? it.banner ?? undefined,
      likeCount: it.likeCount ?? it.likes ?? (Array.isArray(it.likedBy) ? it.likedBy.length : 0) ?? 0,
      goingCount: it.goingCount ?? it.going ?? it.attending ?? (Array.isArray(it.goingBy) ? it.goingBy.length : 0) ?? 0,
      likedBy: it.likedBy,
      goingBy: it.goingBy,
    };
  }).filter(e => !!e._id);
}

export default function HomeScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userId');
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          setUserId(parsed?.id ?? parsed?._id ?? String(parsed) ?? null);
        } catch {
          setUserId(raw);
        }
      } catch {}
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data1 = await api.get<any>('/events', undefined, 25000, 1);
      let list = normalize(pickArray(data1));
      if (!list.length) {
        const data2 = await api.get<any>('/events/list', undefined, 25000, 1);
        list = normalize(pickArray(data2));
      }
      setItems(list);
    } catch (err: any) {
      const reason = err?.name === 'AbortError' ? 'De verbinding duurde te lang (timeout).' : String(err?.message || 'Onbekende fout');
      setError(`${reason}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Even geduld…</Text>
          <Text style={[styles.muted, { marginTop: 8 }]}>API: {api.baseUrl}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Er ging iets mis</Text>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={load}>
            <Text style={styles.buttonLabel}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!items.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Geen events</Text>
          <Text style={styles.muted}>Er zijn momenteel geen events om te tonen.</Text>
          <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={load}>
            <Text style={styles.buttonLabel}>Vernieuwen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => {
          const liked = !!(userId && Array.isArray(item.likedBy) && item.likedBy.includes(userId));
          const going = !!(userId && Array.isArray(item.goingBy) && item.goingBy.includes(userId));
          return (
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/(tabs)/(home)/details', params: { eventId: item._id, userId: userId ?? '' } })
                }
              >
                <View style={styles.row}>
                  <Image source={{ uri: item.imageUrl ?? 'https://via.placeholder.com/160x160?text=Event' }} style={styles.thumb} />
                  <View style={styles.meta}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    {!!(item.date || item.startDate) && (
                      <Text style={styles.cardMeta}>{new Date(item.date ?? item.startDate!).toLocaleString('nl-BE')}</Text>
                    )}
                    <Text style={styles.cardCounts}>❤️ {item.likeCount ?? 0}   •   ✅ {item.goingCount ?? 0}</Text>
                  </View>
                </View>
              </Pressable>

              {userId ? (
                <EventActions
                  eventId={item._id}
                  userId={userId}
                  liked={liked}
                  going={going}
                  likeCount={item.likeCount ?? 0}
                  goingCount={item.goingCount ?? 0}
                  onChanged={(next) => {
                    setItems(curr => curr.map(ev => ev._id === item._id
                      ? { ...ev, likeCount: next.likeCount, goingCount: next.goingCount,
                          likedBy: updateSet(ev.likedBy, userId, next.liked),
                          goingBy: updateSet(ev.goingBy, userId, next.going),
                        }
                      : ev));
                  }}
                />
              ) : null}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function updateSet(arr: string[]|undefined, id: string, include: boolean) {
  const set = new Set(arr ?? []);
  if (include) set.add(id); else set.delete(id);
  return Array.from(set);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  muted: { marginTop: 6, color: '#666', textAlign: 'center' },
  listContent: { padding: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
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
  meta: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { marginTop: 4, color: '#666' },
  cardCounts: { marginTop: 6, fontWeight: '600' },
  button: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#111827', borderRadius: 10 },
  buttonLabel: { color: '#fff', fontWeight: '700' },
});
