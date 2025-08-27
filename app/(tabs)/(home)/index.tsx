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
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import EventActions from '@/components/EventActions';

type EventListItem = {
  _id: string;
  title?: string;
  teaser?: string;
  location?: string;
  date?: string;
  startDate?: string;
  imageUrl?: string;
  keywords?: string[];
  likesCount?: number;
  goingCount?: number;
  __liked?: boolean;
  __going?: boolean;
};

function pickArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
const normalize = (arr: any[]) =>
  arr.map((e: any) => ({
    _id: e._id ?? e.id,
    title: e.title ?? e.name ?? e.teaser ?? 'Untitled',
    teaser: e.teaser ?? '',
    location: e.location ?? '',
    date: e.date ?? e.startDate ?? e.createdAt,
    startDate: e.startDate,
    imageUrl: e.imageUrl ?? e.cover ?? e.banner ?? '',
    keywords: e.keywords ?? [],
    likesCount: e.likesCount ?? e.likes ?? (Array.isArray(e.likedBy) ? e.likedBy.length : 0) ?? 0,
    goingCount: e.goingCount ?? e.going ?? (Array.isArray(e.goingBy) ? e.goingBy.length : 0) ?? 0,
  })).filter((e) => e._id);

async function fetchIds(url: string): Promise<Set<string>> {
  try {
    const data = await api.get<any>(url, undefined, 20000, 1);
    const arr = pickArray(data);
    return new Set(arr.map((e: any) => e._id ?? e.id).filter(Boolean));
  } catch {
    return new Set();
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user id
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

      // 1) Load events
      const data1 = await api.get<any>('/events', undefined, 25000, 1);
      let list = normalize(pickArray(data1));
      if (!list.length) {
        const data2 = await api.get<any>('/events/list', undefined, 25000, 1);
        list = normalize(pickArray(data2));
      }

      // 2) If we know the user, pull liked + going sets from archive endpoints
      if (userId) {
        const [likedIds, goingIds] = await Promise.all([
          fetchIds(`/events/mine/list?userId=${encodeURIComponent(userId)}&status=like&limit=500`),
          fetchIds(`/events/mine/list?userId=${encodeURIComponent(userId)}&status=going&limit=500`),
        ]);
        list = list.map((e) => ({
          ...e,
          __liked: likedIds.has(e._id),
          __going: goingIds.has(e._id),
        }));
      }

      setItems(list);
    } catch (err: any) {
      setError(err?.message || 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 🔁 Refetch whenever the screen gains focus (no useFocusEffect)
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Initial fetch
  useEffect(() => { load(); }, [load]);

  const openDetails = (id: string) => {
    router.push({ pathname: '/(tabs)/(home)/details', params: { eventId: id, userId: userId ?? '' } });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Even geduld…</Text>
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
          <Text style={styles.title}>Geen events gevonden</Text>
          <Text style={styles.muted}>Voeg een event toe bij “Settings”.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => {
          const liked = !!item.__liked;
          const going = !!item.__going;
          return (
            <View style={styles.card}>
              <Pressable onPress={() => openDetails(item._id)}>
                <View style={styles.mediaWrap}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
                  )}
                  <View style={styles.badgesRow}>
                    {(item.keywords ?? []).slice(0, 3).map((k: string) => (
                      <View key={k} style={styles.badge}><Text style={styles.badgeText}>{k}</Text></View>
                    ))}
                  </View>
                </View>
              </Pressable>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title || item.teaser || 'Untitled event'}
                </Text>

                {!!(item.date || item.startDate) && (
                  <Text style={styles.cardMeta}>
                    {new Date(item.date ?? item.startDate!).toLocaleString('nl-BE')}
                  </Text>
                )}

                <Text style={styles.cardCounts}>
                  ❤️ {item.likesCount ?? 0}   •   ✅ {item.goingCount ?? 0}
                </Text>

                {userId ? (
                  <EventActions
                    eventId={item._id}
                    userId={userId}
                    liked={liked}
                    going={going}
                    likeCount={item.likesCount ?? 0}
                    goingCount={item.goingCount ?? 0}
                    onChanged={(next) => {
                      setItems((curr) =>
                        curr.map((ev) =>
                          ev._id === item._id
                            ? {
                                ...ev,
                                __liked: next.liked,
                                __going: next.going,
                                likesCount: next.likeCount,
                                goingCount: next.goingCount,
                              }
                            : ev
                        )
                      );
                    }}
                  />
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#e5e7eb' },
  muted: { marginTop: 6, color: '#9ca3af' },
  button: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 10 },
  buttonLabel: { color: '#fff', fontWeight: '800' },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  mediaWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 200 },
  cardImagePlaceholder: { backgroundColor: '#374151' },
  badgesRow: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.3 },

  cardBody: { padding: 14 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#f9fafb' },
  cardMeta: { color: '#cbd5e1', marginTop: 6 },
  cardCounts: { color: '#d1d5db', marginTop: 8, marginBottom: 6, fontWeight: '600' },
});
