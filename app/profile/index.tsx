import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    router,
} from "expo-router";

import {
    COLORS,
} from "@/src/styles/colors";

import {
    getMeRequest,
} from "@/src/services/authService";

import {
    removeToken,
} from "@/src/utils/authStorage";

export default function ProfileScreen() {

    const [user, setUser] =
        useState<any>(null);

    useEffect(() => {

        loadUser();

    }, []);

    const loadUser = async () => {

        try {

            const data =
                await getMeRequest();

            setUser(data);

        } catch (error) {

            console.log(error);
        }
    };

    const handleLogout = () => {

        Alert.alert(

            "Cerrar sesión",

            "¿Seguro que deseas salir?",

            [

                {
                    text: "Cancelar",
                    style: "cancel",
                },

                {
                    text: "Salir",

                    style: "destructive",

                    onPress: async () => {

                        await removeToken();

                        router.replace("/");
                    }
                }
            ]
        );
    };

    const initials = user?.nombre
        ?.split(" ")
        .map((word: string) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={{
                paddingBottom: 60,
            }}
        >

            <View style={styles.header}>

                <View style={styles.avatar}>

                    <Text style={styles.avatarText}>
                        {initials}
                    </Text>

                </View>

                <Text style={styles.name}>
                    {user?.nombre}
                </Text>

                <Text style={styles.email}>
                    {user?.email}
                </Text>

            </View>

            <View style={styles.section}>

                <TouchableOpacity
                    style={styles.option}
                    onPress={() => {

                        router.push(
                            "/payment-methods"
                        );
                    }}
                >

                    <Text style={styles.optionText}>
                        💳 Métodos de pago
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.option}
                >

                    <Text style={styles.optionText}>
                        👤 Editar perfil
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >

                    <Text style={styles.logoutText}>
                        Cerrar sesión
                    </Text>

                </TouchableOpacity>

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        backgroundColor: COLORS.primary,

        paddingTop: 90,
        paddingBottom: 50,

        alignItems: "center",

        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    avatar: {
        width: 92,
        height: 92,

        borderRadius: 46,

        backgroundColor: "rgba(255,255,255,0.2)",

        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "white",
        fontSize: 34,
        fontWeight: "bold",
    },

    name: {
        marginTop: 18,
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
    },

    email: {
        marginTop: 8,
        color: "rgba(255,255,255,0.8)",
        fontSize: 15,
    },

    section: {
        padding: 24,
    },

    option: {
        backgroundColor: "white",

        padding: 22,

        borderRadius: 22,

        marginBottom: 16,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    optionText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
    },

    logoutButton: {
        backgroundColor: "#EF4444",

        padding: 20,

        borderRadius: 22,

        marginTop: 28,

        alignItems: "center",
    },

    logoutText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});