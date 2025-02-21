import { SignOutButton } from '@/components/Button/signoutButton'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, Redirect } from 'expo-router'
import { Text, View, Image } from 'react-native'

export default function Page() {
  const { user } = useUser()

  return (
    <View className='flex-1 justify-center items-center bg-black p-4'>
      <SignedIn>
        <Redirect href='/meetings/' />
      </SignedIn>
      <SignedOut>
        <View className='flex-1 justify-center items-center gap-4 w-full'>
          <Image source={require('../assets/icon.png')} className='w-64 h-64' />
          <Link href="/auth/sign-in" className='bg-white p-4 rounded-full w-[80%] font-semibold text-black text-lg text-center'>
            <Text>Sign in</Text>
          </Link>
          <Link href="/auth/sign-up" className='bg-[#141414] p-4 border border-gray-500 rounded-full w-[80%] font-semibold text-white text-lg text-center'>
            <Text>Sign up</Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  )
}