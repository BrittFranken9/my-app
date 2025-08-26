import mutation from './_mutation';
import useSWRMutation from 'swr/mutation';
import { API_URL } from '@/constants/Api';

export default function useUserPut (id: any) {
  console.log(id);
  const { trigger, data, error, isMutating } = useSWRMutation(`${API_URL}/users/${id}`, (url, { arg }: { arg: any }) => 
    { return mutation(url, {
      method: 'PUT',
      body: arg,
    });
  });

  return {
    data,
    isMutating,
    isError: error,
    trigger
  }
}
