import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const meetingsData = [
    { id: 1, title: 'Project Kickoff', date: '2024-03-10', time: '10:00 AM', summary: 'Initial project discussion.' },
    { id: 2, title: 'Sprint Planning', date: '2024-03-15', time: '02:00 PM', summary: 'Planning for the next sprint.' },
    { id: 3, title: 'Team Meeting', date: '2024-03-22', time: '11:00 AM', summary: 'Weekly team update.' },
];

export default function MeetingsScreen() {
    const renderMeetingItem = ({ item }: { item: { id: number; title: string; date: string; time: string; summary: string; } }) => (
        <TouchableOpacity className='mb-4 p-4 rounded-lg w-full' style={{ backgroundColor: getRandomPastelColor() }} onPress={() => {/* Navigate to meeting detail screen later */ }}>
            <Text className='font-bold text-lg'>{item.title}</Text>
            <Text className='text-sm'>{item.date} - {item.time}</Text>
            <Text className='text-sm'>{item.summary}</Text>
        </TouchableOpacity>
    );

    const getRandomPastelColor = () => {
        const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];
        return pastelColors[Math.floor(Math.random() * pastelColors.length)];
    };

    return (
        <View className='flex-1 bg-black p-4'>
            <Text className='text-semibold text-white text-xl'>Hii 👋 Harshit</Text>
            <Text className='text-white text-xl'>Here are your meetings</Text>
            <FlatList
                data={meetingsData}
                renderItem={renderMeetingItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}