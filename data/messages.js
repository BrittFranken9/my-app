import fetcher from './_fetcher';
import useSWR from 'swr';
import { API_URL } from '@/constants/Api';

export default function useUsers(url) {
  const { data, error, isLoading } = useSWR(`${API_URL}/users`, fetcher);

  return {
    data,
    isLoading,
    isError: error
  }
}