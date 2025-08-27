import React, { useState, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '@/lib/api';

type Props = {
  eventId: string;
  userId: string;
  liked?: boolean;
  going?: boolean;
  likeCount?: number;
  goingCount?: number;
  onChanged?: (next: { liked: boolean; going: boolean; likeCount: number; goingCount: number }) => void;
};

export default function EventActions({
  eventId,
  userId,
  liked: liked0 = false,
  going: going0 = false,
  likeCount: likeCount0 = 0,
  goingCount: goingCount0 = 0,
  onChanged,
}: Props) {
  const [liked, setLiked] = useState(!!liked0);
  const [going, setGoing] = useState(!!going0);
  const [likeCount, setLikeCount] = useState(likeCount0);
  const [goingCount, setGoingCount] = useState(goingCount0);
  const [pending, setPending] = useState<'like' | 'going' | null>(null);

  const toggleLike = useCallback(async () => {
    if (pending) return;

    const nextOn = !liked;
    const prevLiked = liked;
    const prevCount = likeCount;

    // optimistic update
    setPending('like');
    setLiked(nextOn);
    setLikeCount((n) => n + (nextOn ? 1 : -1));

    try {
      await api.post(`/events/${eventId}/like`, { userId: String(userId || ''), on: nextOn });
      onChanged?.({
        liked: nextOn,
        going,
        likeCount: prevCount + (nextOn ? 1 : -1),
        goingCount,
      });
    } catch (e: any) {
      // rollback on failure
      setLiked(prevLiked);
      setLikeCount(prevCount);
      Alert.alert('Kon niet liken', e?.message || 'Er ging iets mis bij liken.');
    } finally {
      setPending(null);
    }
  }, [pending, liked, userId, eventId, going, likeCount, goingCount, onChanged]);

  const toggleGoing = useCallback(async () => {
    if (pending) return;

    const nextOn = !going;
    const prevGoing = going;
    const prevCount = goingCount;

    // optimistic update
    setPending('going');
    setGoing(nextOn);
    setGoingCount((n) => n + (nextOn ? 1 : -1));

    try {
      await api.post(`/events/${eventId}/going`, { userId: String(userId || ''), on: nextOn });
      onChanged?.({
        liked,
        going: nextOn,
        likeCount,
        goingCount: prevCount + (nextOn ? 1 : -1),
      });
    } catch (e: any) {
      // rollback on failure
      setGoing(prevGoing);
      setGoingCount(prevCount);
      Alert.alert('Kon “Ik ga” niet aanpassen', e?.message || 'Er ging iets mis bij opslaan.');
    } finally {
      setPending(null);
    }
  }, [pending, going, userId, eventId, liked, likeCount, goingCount, onChanged]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, liked && styles.btnActive]}
        onPress={toggleLike}
        disabled={pending === 'like'}
      >
        <Text style={[styles.btnLabel, liked && styles.btnLabelActive]}>
          ❤️ Like ({likeCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, going && styles.btnActive]}
        onPress={toggleGoing}
        disabled={pending === 'going'}
      >
        <Text style={[styles.btnLabel, going && styles.btnLabelActive]}>
          ✅ Ik ga ({goingCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 12, marginTop: 14 },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  btnActive: { backgroundColor: '#065f46' },
  btnLabel: { color: '#fff', fontWeight: '800', letterSpacing: 0.2 },
  btnLabelActive: { color: '#fff' },
});
