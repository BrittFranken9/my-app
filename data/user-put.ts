import mutation from './_mutation';
import useSWRMutation from 'swr/mutation';
import { API_URL } from '@/constants/Api';

export default function useUserPut(id: string | null) {
  const key = id ? `${API_URL}/users/${id}` : null;
  const { trigger, data, error, isMutating } = useSWRMutation(
    key,
    (url, { arg }: { arg: any }) => mutation(url, { method: 'PUT', body: arg })
  );

  // veilige wrapper: fout geven als id ontbreekt
  const safeTrigger = (arg: any) => {
    if (!id) return Promise.reject(new Error('Geen userId beschikbaar'));
    return trigger(arg);
  };

  return { data, isMutating, isError: error, trigger: safeTrigger };
}
