import Monicon from '@monicon/native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { createApiInstance } from '@/utils/api';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Skeleton from '@/components/Skeleton';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function MeetingsScreen() {
    const [meetingsData, setMeetingsData] = useState<{ id: number; title: string; meeting_date: string; meeting_time: string; summary: string; created_at: string; }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();
    const { user } = useUser();

    const fetchMeetings = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Failed to fetch token');
                return;
            }
            const api = createApiInstance(token);
            const response = await api.get('/meetings');
            console.log(response.data);

            if (response.data.success) {
                const sortedMeetings = response.data.data.sort((a: any, b: any) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    return dateA.getTime() - dateB.getTime();
                });
                setMeetingsData(sortedMeetings);
            } else {
                setError('Failed to fetch meetings');
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMeetings();
        }, [fetchMeetings])
    );

    const getRandomPastelColor = useCallback(() => {
        const pastelColors = [
            '#FFD6D9', '#FFE8D6', '#FFFFD6', '#D6FFE6', '#D6EEFF',
            '#FFE0CC', '#E8CCCC', '#FFCFE2', '#E0F0FF', '#EAD6FF',
            '#D6E8FF', '#D9F5E6', '#F0F8DA', '#FFEAD9', '#F2DAFF'
        ];
        return pastelColors[Math.floor(Math.random() * pastelColors.length)];
    }, []);

    const renderMeetingItem = useMemo(() => ({ item }: { item: { id: number; title: string; meeting_date: string; meeting_time: string; summary: string; created_at: string; } }) => (
        <TouchableOpacity className='justify-between mt-4 p-4 rounded-lg w-full h-56' style={{ backgroundColor: getRandomPastelColor() }} onPress={() => { router.navigate(`/meetings/${item.id}`) }} activeOpacity={0.7}>
            <View>
                <View className='flex-row items-center gap-1'>
                    <Monicon name='ph:calendar' size={18} color='#78716c' />
                    <Text className='font-medium text-stone-500 text-base'>{new Date(item.meeting_date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(item.meeting_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</Text>
                </View>
            </View>
            <View>
                <Text className='mt-2 mb-1 font-medium text-stone-600'>Meeting title</Text>
                <Text className='font-bold text-3xl'>{item.title}</Text>
            </View>
            <View className='bg-[#a8a29e] mt-8 mb-2 h-[1px]' />
            <View>
                <Text className='mb-1 font-medium text-stone-600'>Summary</Text>
                <Text className='text-stone-600'>
                    {item.summary?.length > 100 ? `${item.summary.substring(0, 100)}...` : item.summary}
                </Text>
            </View>
            <View className='top-3 right-3 absolute flex justify-center items-center bg-black rounded-full w-8 h-8'>
                <Monicon name="ph:caret-right" size={16} color='white' />
            </View>
        </TouchableOpacity>
    ), [getRandomPastelColor]);

    return (
        <View className='relative flex-1 bg-black p-6 pb-1'>
            <Text className='font-semibold text-white text-2xl'>Hii 👋 {user?.firstName}</Text>
            <Text className='mb-3 text-white text-2xl'>Here are your meetings</Text>
            {loading ? (
                <>
                    <Skeleton className='mt-7 h-52' />
                    <Skeleton className='mt-4 h-52' />
                    <Skeleton className='mt-4 h-52' />
                    <Skeleton className='mt-4 h-52' />
                </>
            ) : error ? (
                <View className='flex-1 justify-center items-center p-4'>
                    <Text className='-mt-12 text-[#ff0000] text-lg text-center'>{error} An error occurred! Please try restarting the app.</Text>
                </View>
            ) : meetingsData.length < 1 ? (
                <View className='flex-1 justify-center items-center p-4'>
                    <Monicon name="arcticons:robotfindskitten-alt" size={192} color='grey' />
                    <Text className='-mt-12 text-stone-400 text-lg text-center'>There are no meetings as of now. You can create one by clicking on the plus icon.</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={meetingsData}
                        renderItem={renderMeetingItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
            <Pressable className='right-8 bottom-3 absolute flex justify-center items-center bg-black border border-stone-800 rounded-full w-14 h-14' android_ripple={{ color: 'grey', radius: 25 }} onPress={() => { router.navigate('/meetings/create') }}>
                <Monicon name='ph:plus' size={24} color='white' />
            </Pressable>
        </View>
    );
}