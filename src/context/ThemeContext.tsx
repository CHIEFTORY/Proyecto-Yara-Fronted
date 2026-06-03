import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as SystemUI from "expo-system-ui";

import {
    DARK_COLORS,
    LIGHT_COLORS,
} from "@/src/styles/colors";

type ThemeType =
    "light" | "dark";

type ThemeContextType = {

    theme: ThemeType;

    colors: typeof LIGHT_COLORS;

    isDark: boolean;

    toggleTheme: () => void;

    setTheme: (theme: ThemeType) => void;
};

const ThemeContext =
    createContext<ThemeContextType>(
        {} as ThemeContextType
    );

const THEME_KEY = "yara_theme";

const saveTheme = async (theme: ThemeType) => {
    if (Platform.OS === "web") {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(THEME_KEY, theme);
        }
        return;
    }

    await SecureStore.setItemAsync(THEME_KEY, theme);
};

const getSavedTheme = async () => {
    if (Platform.OS === "web") {
        if (typeof localStorage === "undefined") {
            return null;
        }

        return localStorage.getItem(THEME_KEY) as ThemeType | null;
    }

    return await SecureStore.getItemAsync(THEME_KEY) as ThemeType | null;
};

export const ThemeProvider = ({
                                  children,
                              }: any) => {

    const [theme, setTheme] =
        useState<ThemeType>("light");

    useEffect(() => {
        getSavedTheme()
            .then((savedTheme) => {
                if (savedTheme === "dark" || savedTheme === "light") {
                    setTheme(savedTheme);
                }
            })
            .catch(console.log);
    }, []);

    useEffect(() => {
        const backgroundColor =
            theme === "dark"
                ? DARK_COLORS.background
                : LIGHT_COLORS.background;

        SystemUI.setBackgroundColorAsync(backgroundColor)
            .catch(console.log);
    }, [theme]);

    const updateTheme = (nextTheme: ThemeType) => {
        setTheme(nextTheme);
        saveTheme(nextTheme).catch(console.log);
    };

    const toggleTheme = () => {

        updateTheme(
            theme === "light"
                ? "dark"
                : "light"
        );
    };

    const colors =
        theme === "light"
            ? LIGHT_COLORS
            : DARK_COLORS;

    return (

        <ThemeContext.Provider
            value={{
                theme,
                colors,
                isDark: theme === "dark",
                toggleTheme,
                setTheme: updateTheme,
            }}
        >

            {children}

        </ThemeContext.Provider>
    );
};

export const useTheme =
    () => useContext(ThemeContext);
