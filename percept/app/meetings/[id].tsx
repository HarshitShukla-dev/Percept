import Monicon from '@monicon/native';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { createApiInstance } from '@/utils/api';
import { useAuth } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import Skeleton from '@/components/Skeleton';

export default function MeetingDetailsScreen() {
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<boolean>(false);
    const { id } = useLocalSearchParams();
    const { getToken } = useAuth();

    const fetchMeeting = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Failed to fetch token');
                return;
            }
            const api = createApiInstance(token);
            const response = await api.get(`/meetings/${id}`);

            if (response.data.success) {
                setMeeting(response.data.data);
            } else {
                setError('Failed to fetch meeting');
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMeeting();
    }, [fetchMeeting]);

    return (
        <View className='flex-1 bg-black'>
            <View className='flex-row p-4'>
                <Pressable onPress={() => router.back()}>
                    <Monicon name='ph:caret-left' size={24} color='white' />
                </Pressable>
                <Text className='flex-1 font-bold text-white text-xl text-center'>Meeting Details</Text>
            </View>
            {loading ? (
                <View className='flex-1 p-4'>
                    <Skeleton className='h-16' />
                    <Skeleton className='mt-4 h-96' />
                    <Skeleton className='mt-4 h-96' />
                </View>
            ) : error ? (
                <View className='flex-1 justify-center items-center p-4'>
                    <Text className='text-red-500 text-lg text-center'>An error occurred! Please try restarting the app.</Text>
                </View>
            ) : meeting ? (
                <ScrollView className='flex-1 p-4'>
                    <Text className='mb-2 font-bold text-white text-3xl'>{meeting.title}</Text>
                    <View className='flex-row items-center gap-1'>
                        <Monicon name='ph:calendar' size={18} color='#78716c' />
                        <Text className='font-medium text-stone-500'>
                            {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} -
                            {meeting.meeting_time ? new Date(meeting.meeting_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : 'N/A'}
                        </Text>
                    </View>
                    <View className='flex-1 gap-4 my-4'>
                        <View className='bg-[#1d1d1d] px-5 py-4 rounded-md'>
                            <Text className='mb-2 font-bold text-white text-2xl'>Summary</Text>
                            <Text className='text-white text-lg'>{meeting.summary}</Text>
                        </View>
                        <View className='bg-[#1d1d1d] px-5 py-4 rounded-md'>
                            <Text className='mb-2 font-bold text-white text-2xl'>Transcript</Text>
                            {meeting.transcript?.length > 500 ? (
                                <>
                                    <Text className='text-white text-lg'>
                                        {meeting.transcript.slice(0, 500)}
                                        {!expanded && '...'}
                                    </Text>
                                    {expanded && <Text className='text-white text-lg'>{meeting.transcript.slice(500)}</Text>}
                                    <Pressable onPress={() => setExpanded(!expanded)} className='py-1'>
                                        <Text className='text-blue-500'>
                                            View {expanded ? 'Less' : 'Full'} Transcript
                                        </Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Text className='text-white text-lg'>{meeting.transcript}</Text>
                            )}
                        </View>
                        <View className='bg-[#1d1d1d] px-5 py-4 rounded-md'>
                            <Text className='mb-2 font-bold text-white text-2xl'>Key Points</Text>
                            {meeting.key_points && meeting.key_points.map((point: string, index: number) => (
                                <View key={index} className='mb-2'>
                                    <Text className='text-white text-lg'>{index + 1}. {point}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )
                : (
                    <View className='flex-1 justify-center items-center p-4'>
                        <Text className='text-stone-400 text-lg text-center'>Meeting details not found.</Text>
                    </View>
                )}
        </View>
    );
}