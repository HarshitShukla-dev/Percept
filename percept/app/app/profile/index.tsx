// app/profile/index.tsx
import { View, Text } from 'react-native'; // Import Button
import { SignOutButton } from '@/components/Button/signoutButton';

export default function ProfileScreen() {
  return ( 
    <View className='flex-1 bg-black p-4'>
      <View>
        <Text className='text-white'>Profile Screen Content (Placeholder)</Text>
        {/* Add a placeholder button for Logout later */}
        <SignOutButton/>
      </View>
    </View>
  );
}