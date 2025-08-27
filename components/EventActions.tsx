import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

/**
 * Adjust endpoints if your backend uses different ones.
 * These persist to the server so the archive pages reflect them.
 */
async function likeOn(eventId: string, userId: string) {
  return api.post(`/events/${eventId}/like`, { userId }, 25000, 1);
}
async function likeOff(eventId: string, userId: string) {
  return api.del(`/events/${eventId}/like?userId=${encodeURIComponent(userId)}`, 25000, 1);
}
async function goingOn(eventId: string, userId: string) {
  return api.post(`/events/${eventId}/going`, { userId }, 25000, 1);
}
async function goingOff(eventId: string, userId: string) {
  return api.del(`/events/${eventId}/going?userId=${encodeURIComponent(userId)}`, 25000, 1);
}

export default function EventActions({
  eventId,
  userId,
  liked: likedProp = false,
  going: goingProp = false,
  likeCount: likeCountProp = 0,
  goingCount: goingCountProp = 0,
  onChanged,
}: Props) {
  const [liked, setLiked] = useState<boolean>(likedProp);
  const [going, setGoing] = useState<boolean>(goingProp);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);
  const [goingCount, setGoingCount] = useState<number>(goingCountProp);
  const [pending, setPending] = useState<'like'|'going'|null>(null);

  const toggleLike = useCallback(async () => {
    if (!userId) return;
    const next = !liked;

    // optimistic UI
    setPending('like');
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));

    try {
      if (next) await likeOn(eventId, userId);
      else await likeOff(eventId, userId);

      onChanged?.({
        liked: next,
        going,
        likeCount: likeCount + (next ? 1 : -1),
        goingCount,
      });
    } catch (e) {
      // only revert if the server call *really* failed
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(null);
    }
  }, [eventId, userId, liked, going, likeCount, goingCount, onChanged]);

  const toggleGoing = useCallback(async () => {
    if (!userId) return;
    const next = !going;

    setPending('going');
    setGoing(next);
    setGoingCount((c) => c + (next ? 1 : -1));

    try {
      if (next) await goingOn(eventId, userId);
      else await goingOff(eventId, userId);

      onChanged?.({
        liked,
        going: next,
        likeCount,
        goingCount: goingCount + (next ? 1 : -1),
      });
    } catch (e) {
      setGoing(!next);
      setGoingCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(null);
    }
  }, [eventId, userId, liked, going, likeCount, goingCount, onChanged]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={[styles.btn, liked && styles.btnActive]} onPress={toggleLike} disabled={pending==='like'}>
        <Text style={[styles.btnLabel, liked && styles.btnLabelActive]}>❤️ Like ({likeCount})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, going && styles.btnActive]} onPress={toggleGoing} disabled={pending==='going'}>
        <Text style={[styles.btnLabel, going && styles.btnLabelActive]}>✅ Ik ga ({goingCount})</Text>
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
