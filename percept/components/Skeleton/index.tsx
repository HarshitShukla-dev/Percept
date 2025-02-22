import React from 'react';
import { View } from 'react-native';

interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
    return (
        <View className={`bg-[#292929] animate-pulse rounded-md ${className}`}></View>
    );
};

export default Skeleton;