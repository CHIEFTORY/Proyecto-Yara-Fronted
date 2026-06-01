import {
    Stack,
} from "expo-router";

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

function AppContent() {

    const {
        theme,
    } = useTheme();

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
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
