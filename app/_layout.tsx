import {
    Stack,
} from "expo-router";
import { useEffect } from "react";

import {
    StatusBar,
} from "expo-status-bar";

import {
    ThemeProvider,
    useTheme,
} from "@/src/context/ThemeContext";
import {
    ToastProvider,
} from "@/src/context/ToastContext";
import {
    setupPushNotificationNavigation,
} from "@/src/utils/pushNotifications";

function AppContent() {

    const {
        theme,
        colors,
    } = useTheme();

    useEffect(() => {
        return setupPushNotificationNavigation();
    }, []);

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            />

            <StatusBar
                style={
                    theme === "dark"
                        ? "light"
                        : "dark"
                }
            />
        </>
    );
}

export default function RootLayout() {

    return (

        <ThemeProvider>

            <ToastProvider>

                <AppContent />

            </ToastProvider>

        </ThemeProvider>
    );
}
