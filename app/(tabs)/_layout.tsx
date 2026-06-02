import {
    Tabs,
    router,
} from "expo-router";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    Platform,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    COLORS,
} from "@/src/styles/colors";

import {
    getPendingInvitations,
    getUnreadNotificationsCount,
} from "@/src/services/notificationService";
import {
    api,
} from "@/src/services/api";
import {
    useAppRefresh,
} from "@/src/utils/appEvents";

/* ── Ícono personalizado con badge ── */
function TabIcon({
                     name,
                     color,
                     size,
                     badge,
                     focused,
                 }: {
    name: any;
    color: string;
    size: number;
    badge?: number;
    focused: boolean;
}) {
    return (
        <View style={tabIconStyles.wrapper}>
            {focused && <View style={tabIconStyles.activePill} />}
            <Ionicons
                name={focused ? name.replace("-outline", "") : name}
                size={size}
                color={color}
            />
            {badge && badge > 0 ? (
                <View style={tabIconStyles.badge}>
                    <Text style={tabIconStyles.badgeText}>
                        {badge > 99 ? "99+" : badge}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const tabIconStyles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: 48,
        height: 36,
    },

    activePill: {
        position: "absolute",
        top: 0,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },

    badge: {
        position: "absolute",
        top: -2,
        right: 2,
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
    },
});

export default function TabsLayout() {

    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const checkingBackendRef = useRef(false);

    const checkBackendAvailability = useCallback(async () => {
        if (checkingBackendRef.current) return;

        try {
            checkingBackendRef.current = true;
            await api.get("/health", { timeout: 5000 });
        } catch (error) {
            console.log(error);
            router.replace("/server-down" as any);
        } finally {
            checkingBackendRef.current = false;
        }
    }, []);

    const loadUnreadNotifications = useCallback(async () => {
        try {
            const [unreadTotal, pendingInvitations] = await Promise.all([
                getUnreadNotificationsCount(),
                getPendingInvitations(),
            ]);

            setUnreadNotifications(unreadTotal + pendingInvitations.length);
        } catch (error) {
            console.log(error);
            checkBackendAvailability();
        }
    }, [checkBackendAvailability]);

    useEffect(() => {
        loadUnreadNotifications();
        const interval = setInterval(() => {
            loadUnreadNotifications();
        }, 3000);
        return () => clearInterval(interval);
    }, [loadUnreadNotifications]);

    useAppRefresh(["badge", "activity", "payments"], loadUnreadNotifications);

    useEffect(() => {
        checkBackendAvailability();
        const interval = setInterval(() => {
            checkBackendAvailability();
        }, 8000);

        return () => clearInterval(interval);
    }, [checkBackendAvailability]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: "#94A3B8",
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: 2,
                },
                tabBarStyle: {
                    height: Platform.OS === "ios" ? 86 : 74,
                    paddingBottom: Platform.OS === "ios" ? 22 : 10,
                    paddingTop: 10,
                    borderTopWidth: 0,
                    backgroundColor: "#FFFFFF",
                    elevation: 0,
                    shadowColor: "#94A3B8",
                    shadowOpacity: 0.12,
                    shadowOffset: { width: 0, height: -4 },
                    shadowRadius: 16,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="home-outline"
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="groups"
                options={{
                    title: "Grupos",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="people-outline"
                            color={color}
                            size={size}
                            focused={focused}
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
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="pulse-outline"
                            color={color}
                            size={size}
                            focused={focused}
                            badge={unreadNotifications}
                        />
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        loadUnreadNotifications();
                    },
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="person-outline"
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
