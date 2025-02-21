import * as React from 'react';
import { Text, TextInput, Button, View, Pressable } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState('');

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        try {
            await signUp.create({
                emailAddress,
                password,
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    if (pendingVerification) {
        return (
            <View>
                <Text>Verify your email</Text>
                <TextInput
                    value={code}
                    placeholder="Enter verification code"
                    onChangeText={(code) => setCode(code)}
                />
                <Button title="Verify" onPress={onVerifyPress} />
            </View>
        );
    }

    return (
        <View className='flex-1 justify-center items-center gap-6 bg-black p-4'>
            <Text className='mb-4 font-bold text-white text-4xl'>Sign up</Text>
            <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                onChangeText={(email) => setEmailAddress(email)}
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
            <Pressable onPress={onSignUpPress} className='bg-white p-3 rounded-full w-[80%]'>
                <Text className='font-semibold text-black text-lg text-center'>Sign Up</Text>
            </Pressable>
            <View className='flex-row gap-2 mt-4'>
                <Text className='text-white/60'>Have an account?</Text>
                <Link href="/auth/sign-in">
                    <Text className='font-semibold text-white'>Sign in</Text>
                </Link>
            </View>
        </View>
    );
}