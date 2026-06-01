import {
    createContext,
    useContext,
    useState,
} from "react";

import {
    DARK_COLORS,
    LIGHT_COLORS,
} from "@/src/styles/colors";

type ThemeType =
    "light" | "dark";

type ThemeContextType = {

    theme: ThemeType;

    colors: typeof LIGHT_COLORS;

    toggleTheme: () => void;
};

const ThemeContext =
    createContext<ThemeContextType>(
        {} as ThemeContextType
    );

export const ThemeProvider = ({
                                  children,
                              }: any) => {

    const [theme, setTheme] =
        useState<ThemeType>("light");

    const toggleTheme = () => {

        setTheme(prev =>
            prev === "light"
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
                toggleTheme,
            }}
        >

            {children}

        </ThemeContext.Provider>
    );
};

export const useTheme =
    () => useContext(ThemeContext);