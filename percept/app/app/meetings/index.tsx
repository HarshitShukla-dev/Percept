import Monicon from '@monicon/native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { createApiInstance } from '@/utils/api';
import { useAuth } from '@clerk/clerk-expo';

export default function MeetingsScreen() {
    const [meetingsData, setMeetingsData] = useState<{ id: number; title: string; meeting_date: string; meeting_time: string; summary: string; }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    setError('Failed to fetch token');
                    return;
                }
                console.log(token);
                const api = createApiInstance(token);
                const response = await api.get('/meetings');

                if (response.data.success) {
                    setMeetingsData(response.data.data);
                } else {
                    setError('Failed to fetch meetings');
                }
            } catch (error: any) {
                setError(error.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    if (loading) {
        return (
            <View className='flex-1 justify-center items-center bg-black'>
                <Text className='text-white'>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className='flex-1 justify-center items-center bg-black'>
                <Text className='text-white'>{error}</Text>
            </View>
        );
    }

    const renderMeetingItem = ({ item }: { item: { id: number; title: string; meeting_date: string; meeting_time: string; summary: string; } }) => (
        <TouchableOpacity className='justify-between mt-4 p-4 rounded-lg w-full h-52' style={{ backgroundColor: getRandomPastelColor() }} onPress={() => {/* Navigate to meeting detail screen later */ }}>
            <Text className='font-bold text-lg'>{item.title}</Text>
            <Text className='text-sm'>{item.meeting_date} - {item.meeting_time}</Text>
            <Text className='text-sm'>{item.summary}</Text>
        </TouchableOpacity>
    );
    
    const getRandomPastelColor = () => {
        const pastelColors = [
            '#FFD6D9', '#FFE8D6', '#FFFFD6', '#D6FFE6', '#D6EEFF',
            '#FFE0CC', '#E8CCCC', '#FFCFE2', '#E0F0FF', '#EAD6FF',
            '#D6E8FF', '#D9F5E6', '#F0F8DA', '#FFEAD9', '#F2DAFF'
        ];
        return pastelColors[Math.floor(Math.random() * pastelColors.length)];
    };

    return (
        <View className='relative flex-1 bg-black p-6 pb-1'>
            <Text className='font-semibold text-white text-2xl'>Hii 👋 Harshit</Text>
            <Text className='mb-3 text-white text-2xl'>Here are your meetings</Text>
            <FlatList
                data={meetingsData}
                renderItem={renderMeetingItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
            />
            <Pressable className='right-8 bottom-3 absolute flex justify-center items-center bg-black border border-gray-800 rounded-full w-14 h-14' >
                <Monicon name='ph:plus' size={24} color='white' />
            </Pressable>
        </View>
    );
}