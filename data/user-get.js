import fetcher from './_fetcher';
import useSWR from 'swr';
import { API_URL } from '@/constants/Api';

export default function useUserGet(id) {
  const valid = typeof id === 'string' && id.length > 0;
  const key = valid ? `${API_URL}/users/${id}` : null; // null => skip
  const { data, error, isLoading } = useSWR(key, fetcher);
  return { data, isLoading, isError: error };
}