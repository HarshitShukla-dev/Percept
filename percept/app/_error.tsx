import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ErrorProps {
    error?: Error;
    resetError?: () => void;
}

export default function ErrorScreen({ error, resetError }: ErrorProps) {
    const navigation = useNavigation();

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleRetry = () => {
        if (resetError) {
            resetError();
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-white p-6">
            <View className="bg-red-50 shadow-md p-6 rounded-lg w-full max-w-md">
                <Text className="mb-4 font-bold text-red-600 text-2xl">Oops! Something went wrong</Text>
                
                {error && error.message ? (
                    <View className="bg-red-100 mb-4 p-3 rounded">
                        <Text className="text-red-800 text-sm">{error.message}</Text>
                    </View>
                ) : null}
                
                <Text className="mb-6 text-gray-700">
                    We apologize for the inconvenience. Please try again or go back to the previous screen.
                </Text>
                
                <View className="flex-row justify-between">
                    <TouchableOpacity 
                        onPress={handleGoBack}
                        className="bg-gray-500 px-6 py-3 rounded-md">
                        <Text className="font-medium text-white">Go Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={handleRetry}
                        className="bg-red-600 px-6 py-3 rounded-md">
                        <Text className="font-medium text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}