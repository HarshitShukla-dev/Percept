import Monicon from '@monicon/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createApiInstance } from '@/utils/api';

interface AudioFile {
    uri: string | null;
    type: string | null;
    name: string | null;
}

interface MeetingResponse {
    success: boolean;
    data: {
        id: number;
        user_id: string;
        title: string;
        transcript: null | string;
        summary: null | string;
        meeting_date: null | string;
        meeting_time: null | string;
        key_points: null | string;
        participants: null | string;
        created_at: string;
        updated_at: string;
    };
}

export default function App() {
    const [meetingName, setMeetingName] = useState('');
    const [audioFile, setAudioFile] = useState<AudioFile>({ uri: null, type: null, name: null });
    const [recording, setRecording] = useState(false);
    const { getToken } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { user } = useUser();
    const recipientEmail = user?.primaryEmailAddress;

    const toggleRecording = () => {
        if (recording) {
            setRecording(false);
            Alert.alert('Recording stopped', 'Please upload an audio file instead');
        } else {
            setRecording(true);
            setTimeout(() => {
                setRecording(false);
                Alert.alert('Recording stopped', 'Please upload an audio file instead');
            }, 20000);
        }
    };

    const pickAudioFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setAudioFile({
                    uri: asset.uri,
                    type: asset.mimeType ?? null,
                    name: asset.name
                });
                Alert.alert('Success', 'Audio file selected successfully');
            }
        } catch (error) {
            console.error('Error picking audio file:', error);
            Alert.alert('Error', 'Failed to pick audio file');
        }
    };

    const createMeeting = async () => {
        if (!meetingName.trim()) {
            Alert.alert('Please enter a meeting name');
            return;
        }

        if (!audioFile.uri) {
            Alert.alert('Please upload an audio file');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                setError('Failed to fetch token');
                return;
            }
            const api = createApiInstance(token);

            const meetingResponse = await api.post<MeetingResponse>('/meetings', {
                title: meetingName,
                meeting_date: new Date().toISOString().split('T')[0],
                meeting_time: new Date().toISOString().split('T')[1]
            });

            if (!meetingResponse.data.success) {
                throw new Error('Failed to create meeting');
            }

            const meetingId = meetingResponse.data.data.id;

            const formData = new FormData();
            formData.append('audio', {
                uri: audioFile.uri,
                type: audioFile.type ?? 'audio/mpeg',
                name: audioFile.name ?? 'audiofile.mp3',
            } as any);

            const token2 = await getToken();
            if (!token2) {
                setError('Failed to fetch token');
                return;
            }
            const api2 = createApiInstance(token2);
            const uploadResponse = await api2.post(
                `/meetings/${meetingId}/process`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            if (uploadResponse.status === 200) {
                const token3 = await getToken();
                if (!token3) {
                    setError('Failed to fetch token');
                    return;
                }
                const api3 = createApiInstance(token3);
                await api3.post(`/meetings/${meetingId}/share-email`, {
                    recipientEmail: recipientEmail?.emailAddress
                });

                Alert.alert('Success', 'Meeting created and summary sent to email');
                router.navigate(`/meetings/${meetingId}`);
            } else {
                throw new Error('Failed to process audio');
            }
        } catch (error) {
            setError('Failed to create meeting and process audio');
            Alert.alert('Error', 'Failed to create meeting and process audio');
            console.error(error);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <View className='flex-1 bg-black'>
            <View className='flex-row p-4'>
                <Pressable onPress={() => router.back()}>
                    <Monicon name='ph:caret-left' size={24} color='white' />
                </Pressable>
                <Text className='flex-1 font-bold text-white text-xl text-center'>Create Meeting</Text>
            </View>

            <View className='p-4'>
                <Text className='text-stone-300'>Meeting Name</Text>
                <TextInput
                    className='py-1 h-10 font-bold text-white text-2xl'
                    placeholderTextColor={"gray"}
                    placeholder='Enter Meeting Name'
                    onChangeText={setMeetingName}
                    value={meetingName}
                />
            </View>

            {recording &&
                <View className='bottom-72 absolute inset-0 justify-center items-center animate-pulse'>
                    <Monicon name='ph:waveform' size={110} color='white' />
                </View>
            }

            <View className='flex-1 justify-center items-center p-4'>
                <Pressable
                    className='bg-stone-950 p-4 border border-stone-700 rounded-full'
                    onPress={toggleRecording}
                >
                    <Monicon
                        name={recording ? "ph:stop-fill" : "ph:microphone"}
                        size={50}
                        color={recording ? 'red' : 'white'}
                    />
                </Pressable>
                <Pressable onPress={pickAudioFile}>
                    <Text className='mt-4 text-stone-200 underline'>Upload a file</Text>
                </Pressable>

                {audioFile.name && (
                    <Text className='mt-2 text-stone-400'>
                        Selected: {audioFile.name}
                    </Text>
                )}
            </View>

            {isLoading && (
                <View className='absolute inset-0 justify-center items-center bg-stone-950'>
                    <ActivityIndicator size="large" color="white" />
                    {uploadProgress > 0 && (
                        <View className='mt-4'>
                            <Text className='text-white text-center'>
                                Uploading: {uploadProgress}%
                            </Text>
                            <View className='bg-stone-800 mt-2 rounded-full w-64 h-2'>
                                <View
                                    className='bg-white rounded-full h-full'
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </View>
                        </View>
                    )}
                </View>
            )}

            <View className='p-4'>
                <Pressable
                    className='bg-stone-950 p-4 rounded-full'
                    onPress={createMeeting}
                    disabled={isLoading}
                >
                    <Text className='font-bold text-white text-center'>
                        {isLoading ? 'Creating Meeting...' : 'Create Meeting'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}