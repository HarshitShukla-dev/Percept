import { View, Text, Image, ScrollView, Pressable, Linking } from 'react-native';
import { SignOutButton } from '@/components/Button/signoutButton';
import { useUser } from '@clerk/clerk-expo';
import { Monicon } from '@monicon/native';

export default function ProfileScreen() {
  const { user } = useUser();
  if (!user) return null;

  const {
    fullName,
    primaryEmailAddress,
    username,
    imageUrl,
    externalAccounts,
    createdAt,
    lastSignInAt
  } = user;

  const githubAccount = externalAccounts.find(account => account.provider === 'github');

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openGithubProfile = () => {
    if (githubAccount?.username) {
      Linking.openURL(`https://github.com/${githubAccount.username}`);
    }
  };

  return (
    <ScrollView className='flex-1 bg-black'>
      <View className='p-4'>
        <View className='items-center space-y-4'>
          <Image
            source={{ uri: imageUrl }}
            className='rounded-full w-32 h-32'
          />
          <View className='items-center space-y-2'>
            <Text className='font-bold text-white text-2xl'>
              {fullName || username}
            </Text>
            <Text className='text-gray-400'>
              {primaryEmailAddress?.emailAddress}
            </Text>
          </View>

          {/* Account Information */}
          <View className='space-y-4 bg-stone-900 mt-6 p-4 rounded-lg w-full'>
            <Text className='mb-2 font-semibold text-white text-lg'>Account Information</Text>

            <View className='space-y-3'>
              <View className='flex-row justify-between items-center py-2 border-gray-800 border-b'>
                <Text className='text-white'>Username</Text>
                <Text className='text-gray-400'>{username}</Text>
              </View>

              <View className='flex-row justify-between items-center py-2 border-gray-800 border-b'>
                <Text className='text-white'>Email</Text>
                <Text className='text-gray-400'>{primaryEmailAddress?.emailAddress}</Text>
              </View>

              <View className='flex-row justify-between items-center py-2 border-gray-800 border-b'>
                <Text className='text-white'>Member Since</Text>
                <Text className='text-gray-400'>{formatDate(createdAt)}</Text>
              </View>

              <View className='flex-row justify-between items-center py-2'>
                <Text className='text-white'>Last Sign In</Text>
                <Text className='text-gray-400'>{formatDate(lastSignInAt)}</Text>
              </View>
            </View>
          </View>

          {/* Connected Accounts */}
          {githubAccount && (
            <View className='bg-stone-900 mt-4 p-4 rounded-lg w-full'>
              <Text className='mb-4 font-semibold text-white text-lg'>Connected Accounts</Text>

              <Pressable
                onPress={openGithubProfile}
                className='flex-row justify-between items-center py-2'
              >
                <View className='flex-row items-center gap-x-3'>
                  <Monicon name="ph:github-logo-fill" size={24} color="white" />
                  <View>
                    <Text className='text-white'>{githubAccount.username}</Text>
                    <Text className='text-gray-400 text-sm'>GitHub</Text>
                  </View>
                </View>
                <Monicon name="ph:caret-right" size={20} color="gray" />
              </Pressable>
            </View>
          )}

          {/* Account Security */}
          <View className='bg-stone-900 mt-4 p-4 rounded-lg w-full'>
            <Text className='mb-4 font-semibold text-white text-lg'>Security</Text>

            <View className='space-y-3'>
              <View className='flex-row justify-between items-center py-2 border-gray-800 border-b'>
                <Text className='text-white'>Two-Factor Auth</Text>
                <Text className='text-gray-400'>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              <View className='flex-row justify-between items-center py-2'>
                <Text className='text-white'>Password Protection</Text>
                <Text className='text-gray-400'>
                  {user.passwordEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          <View className='mt-6 w-full'>
            <SignOutButton />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}