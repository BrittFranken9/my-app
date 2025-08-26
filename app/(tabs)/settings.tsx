import { View, Text, SafeAreaView, StyleSheet, TextInput, Button } from 'react-native';
import useUserGet from '@/data/user-get';
import useUserPut from '@/data/user-put';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useEffect, useState } from 'react';



export default function SettingsScreen() {
  const params = useLocalSearchParams();
  const { data, isLoading, isError } = useUserGet(params.userId);
  const { trigger, isMutating } = useUserPut(params.userId);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (data) {
      setUsername(data.username);
    }
  }, [data]);

  if (isMutating || isLoading || !data) {
    return ( 
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  console.log(username);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText>Settings</ThemedText>
      <TextInput value={username} onChangeText={setUsername}/>
      <Button title="Save" onPress={() => trigger({username})}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ccc' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});