import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, Text } from 'react-native';

export default function GuestLayout() {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
        return <View><Text>Loading...</Text></View>;
    }

    if (isSignedIn) {
        return <Redirect href={'/'} />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}