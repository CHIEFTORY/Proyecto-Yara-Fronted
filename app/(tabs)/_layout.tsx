import {
    Tabs,
    router,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    COLORS,
} from "@/src/styles/colors";

export default function TabsLayout() {

    return (

        <Tabs

            screenOptions={{

                headerShown: false,

                tabBarActiveTintColor:
                COLORS.primary,

                tabBarInactiveTintColor:
                    "#94A3B8",

                tabBarStyle: {

                    height: 74,

                    paddingBottom: 10,

                    paddingTop: 10,

                    borderTopWidth: 0,

                    elevation: 10,

                    shadowOpacity: 0.06,
                },
            }}
        >

            <Tabs.Screen
                name="index"

                options={{

                    title: "Inicio",

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="groups"

                options={{

                    title: "Grupos",

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="people-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}

                listeners={{

                    tabPress: () => {

                        router.replace("/groups" as any);
                    },
                }}
            />

            <Tabs.Screen
                name="activity"

                options={{

                    title: "Actividad",

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="pulse-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"

                options={{

                    title: "Perfil",

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="person-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />



        </Tabs>
    );
}