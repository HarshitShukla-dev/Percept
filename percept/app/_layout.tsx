import { Stack } from "expo-router";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { tokenCache } from "@/cache";
import { View } from 'react-native';

import "../global.css";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <View className="flex-1 bg-black text-white">
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </ClerkLoaded>
    </ClerkProvider>
  )
}
