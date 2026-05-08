import { useEffect, useState } from "react";

import { ActivityIndicator, View } from "react-native";

import { router } from "expo-router";

import LoginScreen from "@/src/screens/auth/LoginScreen";

import { getToken } from "@/src/utils/authStorage";

import { COLORS } from "@/src/styles/colors";

export default function Home() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        checkAuth();

    }, []);

    const checkAuth = async () => {

        try {

            const token = await getToken();

            if (token) {

                router.replace("/dashboard");

            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: COLORS.background,
                }}
            >

                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />

            </View>
        );
    }

    return <LoginScreen />;
}