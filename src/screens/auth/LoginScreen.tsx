import { COLORS } from "@/src/styles/colors";
import { useState } from "react";
import { loginRequest } from "@/src/services/authService";
import { saveToken } from "@/src/utils/authStorage";

import { router } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from "react-native";

export default function LoginScreen() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const response = await loginRequest(
                email,
                password
            );

            // 🔥 MFA
            if (response.mfaRequired) {

                console.log("MFA requerido");

                return;
            }

            // 🔥 GUARDAR JWT
            await saveToken(
                response.token
            );
            router.replace("/dashboard");

            console.log("TOKEN GUARDADO");

        } catch (error) {

            console.log(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.logoContainer}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>Y</Text>
                </View>

                <Text style={styles.title}>
                    Bienvenido a Yara
                </Text>

                <Text style={styles.subtitle}>
                    Gestiona tus gastos compartidos
                </Text>
            </View>

            <View style={styles.card}>

                <Text style={styles.label}>
                    Correo electrónico
                </Text>

                <TextInput
                    placeholder="tu@email.com"
                    placeholderTextColor={COLORS.subtitle}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>
                    Contraseña
                </Text>

                <TextInput
                    placeholder="********"
                    placeholderTextColor={COLORS.subtitle}
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>
                        Iniciar sesión
                    </Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        padding: 24,
    },

    logoContainer: {
        alignItems: "center",
        marginBottom: 32,
    },

    logo: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    logoText: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "bold",
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 8,
        fontSize: 16,
        color: COLORS.subtitle,
    },

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: COLORS.text,
    },

    input: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 16,
    },
});