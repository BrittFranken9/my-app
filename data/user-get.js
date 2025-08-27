import fetcher from './_fetcher';
import useSWR from 'swr';
import { API_URL } from '@/constants/Api';

export default function useUserGet (id) {
  console.log(id);
  const { data, error, isLoading } = useSWR(`${API_URL}/users/${id}`, fetcher);

  return {
    data,
    isLoading,
    isError: error
  }
}