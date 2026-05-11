import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    View,
    Text,
} from "react-native";

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
            await new Promise(
                resolve =>
                    setTimeout(resolve, 1500)
            );
            const token = await getToken();

            if (token) {

                router.replace("/(tabs)" as any)

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

                    backgroundColor: COLORS.primary,
                }}
            >

                <View
                    style={{

                        width: 110,

                        height: 110,

                        borderRadius: 36,

                        backgroundColor:
                            "rgba(255,255,255,0.14)",

                        justifyContent: "center",

                        alignItems: "center",

                        marginBottom: 28,
                    }}
                >

                    <Text
                        style={{

                            color: "white",

                            fontSize: 42,

                            fontWeight: "bold",
                        }}
                    >
                        Y
                    </Text>

                </View>

                <Text
                    style={{

                        fontSize: 34,

                        fontWeight: "bold",

                        color: "white",

                        letterSpacing: 1,
                    }}
                >
                    Yara
                </Text>

                <Text
                    style={{

                        marginTop: 10,

                        color: "rgba(255,255,255,0.72)",

                        fontSize: 15,
                    }}
                >
                    Gestiona tus gastos compartidos
                </Text>

                <ActivityIndicator
                    size="small"
                    color="white"
                    style={{
                        marginTop: 34,
                    }}
                />

            </View>
        );
    }

    return <LoginScreen />;
}