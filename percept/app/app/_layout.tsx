import { Tabs } from "expo-router";
import { SignedIn } from '@clerk/clerk-expo';

export default function AppLayout() {
    return (
        <SignedIn>
            <Tabs
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="meetings/index"
                    options={{
                        tabBarLabel: 'Meetings',
                    }}
                />
                <Tabs.Screen
                    name="tasks/index"
                    options={{
                        tabBarLabel: 'Tasks',
                    }}
                />
                <Tabs.Screen
                    name="profile/index"
                    options={{
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tabs>
        </SignedIn>
    );
}