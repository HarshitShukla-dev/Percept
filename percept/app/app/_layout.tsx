import { Tabs } from 'expo-router';
import { Monicon } from '@monicon/native';
import { Pressable, View } from 'react-native';

// Function to get the correct icon based on the screen name and focus state
const getIcon = (
    routeName: string,
    color: string,
    focused: boolean
) => {
    // Extract the base route name (e.g., 'meetings' from 'meetings/index')
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
                tabBarActiveTintColor: '#c76534',
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
                                className='right-0 bottom-[-8] left-0 absolute bg-[#c76534] mx-auto rounded-xl w-[50%] h-[2.4px] ]'
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
