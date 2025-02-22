import { Tabs } from 'expo-router';
import { Monicon } from '@monicon/native';
import { Pressable, View } from 'react-native';

const getIcon = (
    routeName: string,
    color: string,
    focused: boolean
) => {
    const baseRoute = routeName.split('/')[0] as 'meetings' | 'tasks' | 'profile';

    const icons = {
        meetings: 'ph:presentation',
        tasks: 'ph:calendar-check',
        profile: 'ph:user',
    };

    const iconName = icons[baseRoute] ? (focused ? `${icons[baseRoute]}-fill` : icons[baseRoute]) : 'ph:question';
    return <Monicon name={iconName} size={24} color={color} strokeWidth={2} />;
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarInactiveTintColor: '#5e5e5e',
                tabBarActiveTintColor: 'white',
                tabBarButton: (props) => (
                    <Pressable
                        onPress={props.onPress}
                        onLongPress={props.onLongPress}
                        style={props.style}
                        android_ripple={{ borderless: false, color: 'transparent' }}
                    >
                        {props.children}
                    </Pressable>
                ),
                tabBarStyle:{
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                },
                tabBarIcon: ({ color, focused }) => (
                    <View className='relative flex justify-center items-center w-full'>
                        {getIcon(route.name, color, focused)}
                        {focused && (
                            <View
                                className='right-0 bottom-[-8] left-0 absolute bg-white mx-auto rounded-xl w-[50%] h-[2.4px] ]'
                                style={{
                                    left: '50%',
                                    transform: [{ translateX: '-50%' }],
                                }}
                            />
                        )}
                    </View>
                ),
            })}
        >
            {['meetings', 'tasks', 'profile'].map((screen) => (
                <Tabs.Screen
                    key={screen}
                    name={`${screen}/index`}
                    options={{
                        title: screen.charAt(0).toUpperCase() + screen.slice(1),
                        tabBarShowLabel: false,
                    }}
                />
            ))}
        </Tabs>
    );
}
