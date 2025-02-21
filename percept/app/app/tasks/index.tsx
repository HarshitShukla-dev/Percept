// app/tasks/index.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';

// Placeholder tasks data (replace with API calls later)
const tasksData = [
    { id: 1, title: 'Prepare Presentation', description: 'Create slides for the project update.', deadline: '2024-03-12' },
    { id: 2, title: 'Sprint Review Meeting', description: 'Schedule and conduct sprint review.', deadline: '2024-03-18' },
    { id: 3, title: 'Follow up with John', description: 'Regarding action items from last meeting.', deadline: '2024-03-25' },
];

export default function TasksScreen() {
    const renderTaskItem = ({ item }: { item: { id: number; title: string; description: string; deadline: string } }) => (
        <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Deadline: {item.deadline}</Text>
        </View>
    );

    return (
        <View>
            <FlatList
                data={tasksData}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}