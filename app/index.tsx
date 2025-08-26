import { View, StyleSheet, Alert, SafeAreaView,TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { useEffect } from 'react';
import { API_URL } from '@/constants/Api';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';


export default function LoginScreen() {
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                router.replace('./(tabs)');
            }
        };
        checkLogin();
    }, []);

    const handleGoogleLogin = async () => {
    try {
        const authUrl = `${API_URL}/auth/google`;
        const redirectURL = AuthSession.makeRedirectUri();
        
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectURL);
        console.log(result);

        if (result.type === 'success' && result.url) {
            const params = new URL(result.url).searchParams;

            const user = params.get('user');
            if (user) {
                await AsyncStorage.setItem('userId', user);

                router.replace('./(tabs)');
            }
        } else {
            Alert.alert('Authentication canceled of failed');
        }

    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to authenticate with Google')
    }
};
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Home</ThemedText>
        <TouchableOpacity onPress={() => handleGoogleLogin()}>
          <ThemedText type="title">LOGIN MET GOOGLE</ThemedText>
        </TouchableOpacity>
        <Link href="/details" style={{ marginTop: 12 }}>
          <ThemedText>Ga naar Details</ThemedText>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 16,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
