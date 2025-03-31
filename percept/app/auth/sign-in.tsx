import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, Button, View, Pressable } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

export const useWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    useWarmUpBrowser();
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startSSOFlow } = useSSO();
    const router = useRouter();
    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) return;
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    }, [isLoaded, emailAddress, password]);

    const onGitHubSignInPress = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: 'oauth_github',
                redirectUrl: AuthSession.makeRedirectUri({
                    scheme: 'percept',
                    path: 'redirect'
                }),
            });
            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                router.replace('/');
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    }, [startSSOFlow, setActive, router]);


    return (
        <View className='flex-1 justify-center items-center gap-6 bg-black p-4'>
            <Text className='mb-4 font-bold text-white text-4xl'>Sign in</Text>
            <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                className='bg-white/10 p-4 border border-white/20 rounded-2xl w-[80%] font-medium text-white text-lg'
                placeholderTextColor="#666"
            />
            <TextInput
                value={password}
                placeholder="Enter password"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                className='bg-white/10 p-4 border border-white/20 rounded-2xl w-[80%] font-medium text-white text-lg'
                placeholderTextColor="#666"
            />
            <Pressable onPress={onSignInPress} className='bg-white p-3 rounded-full w-[80%]'>
                <Text className='font-semibold text-black text-lg text-center'>Sign In</Text>
            </Pressable>
            <Pressable onPress={onGitHubSignInPress} className='bg-[#141414] p-3 border border-white/20 rounded-full w-[80%]'>
                <Text className='font-semibold text-white text-lg text-center'>Sign in with Github</Text>
            </Pressable>
            <View className='flex-row gap-2 mt-4'>
                <Text className='text-white/60'>Don't have an account?</Text>
                <Link href="/auth/sign-up">
                    <Text className='font-semibold text-white'>Sign up</Text>
                </Link>
            </View>
        </View>
    );

}