import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { createApiInstance } from '@/utils/api';
import Checkbox from 'expo-checkbox';

export default function TasksScreen() {
    const { getToken } = useAuth();
    const [tasksData, setTasksData] = useState([]);
    const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchTasks = async () => {
            const token = await getToken();
            if (!token) return;
            const api = createApiInstance(token);
            const response = await api.get('/tasks');
            if (response.data.success) {
                setTasksData(response.data.data);
            }
        };

        fetchTasks();
    }, []);

    const renderTaskItem = ({ item }: { item: { id: number; title: string; description: string; deadline: string } }) => (
        <TouchableOpacity onPress={() => setCheckedTasks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>
            <View className='flex-row items-center bg-[#181818] mt-2 p-2 border border-[#292929] rounded-lg'>
                <Checkbox
                    className='mr-4'
                    value={checkedTasks[item.id] || false} />
                <View className='flex-1'>
                    <Text className={`font-bold ${checkedTasks[item.id] ? 'line-through text-gray-500' : 'text-white'}`}>
                        {item.title}
                    </Text>
                    <Text className={` ${checkedTasks[item.id] ? 'line-through text-gray-500' : 'text-gray-400'}`}>
                        {item.description}
                    </Text>
                    <Text className='text-gray-500'>Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className='flex-1 bg-black p-4'>
            <Text className='mb-3 text-white text-2xl'>Your Tasks</Text>
            <FlatList
                data={tasksData}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}