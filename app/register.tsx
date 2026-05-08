import { useState } from "react";

import { registerRequest }
    from "@/src/services/authService";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";

import { router } from "expo-router";

import { COLORS } from "@/src/styles/colors";

export default function RegisterScreen() {

    const [nombre, setNombre] = useState("");

    const [email, setEmail] = useState("");

    const [telefono, setTelefono] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const handleRegister = async () => {

        // 🔥 CAMPOS VACÍOS
        if (
            !nombre ||
            !email ||
            !telefono ||
            !password ||
            !confirmPassword
        ) {

            setErrorMessage(
                "Completa todos los campos"
            );

            return;
        }

        // 🔥 EMAIL
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            setErrorMessage(
                "Ingresa un correo válido"
            );

            return;
        }

        // 🔥 PASSWORDS
        if (password !== confirmPassword) {

            setErrorMessage(
                "Las contraseñas no coinciden"
            );

            return;
        }

        // 🔥 PASSWORD LENGTH
        if (password.length < 6) {

            setErrorMessage(
                "La contraseña debe tener mínimo 6 caracteres"
            );

            return;
        }

        try {

            setLoading(true);

            setErrorMessage("");

            await registerRequest(
                nombre,
                email,
                telefono,
                password
            );

            Alert.alert(
                "Registro exitoso",
                "Tu cuenta ha sido creada correctamente",
                [
                    {
                        text: "Continuar",
                        onPress: () => {
                            router.replace("/");
                        }
                    }
                ]
            );

        } catch (error) {

            setErrorMessage(
                "No se pudo registrar el usuario"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.logoContainer}>

                    <View style={styles.logo}>

                        <Text style={styles.logoText}>
                            Y
                        </Text>

                    </View>

                    <Text style={styles.title}>
                        Crear cuenta
                    </Text>

                    <Text style={styles.subtitle}>
                        Empieza a gestionar tus gastos
                    </Text>

                </View>

                <View style={styles.card}>

                    <Text style={styles.label}>
                        Nombre completo
                    </Text>

                    <TextInput
                        placeholder="Diego García"
                        placeholderTextColor={COLORS.subtitle}
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                    />

                    <Text style={styles.label}>
                        Correo electrónico
                    </Text>

                    <TextInput
                        placeholder="correo@email.com"
                        placeholderTextColor={COLORS.subtitle}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>
                        Teléfono
                    </Text>

                    <TextInput
                        placeholder="999999999"
                        placeholderTextColor={COLORS.subtitle}
                        style={styles.input}
                        value={telefono}
                        onChangeText={setTelefono}
                        keyboardType="phone-pad"
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

                    <Text style={styles.label}>
                        Confirmar contraseña
                    </Text>

                    <TextInput
                        placeholder="********"
                        placeholderTextColor={COLORS.subtitle}
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    {
                        errorMessage ? (

                            <Text style={styles.errorText}>
                                {errorMessage}
                            </Text>

                        ) : null
                    }

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >

                        {
                            loading ? (

                                <ActivityIndicator
                                    color="white"
                                />

                            ) : (

                                <Text style={styles.buttonText}>
                                    Crear cuenta
                                </Text>
                            )
                        }

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            router.replace("/")
                        }
                    >

                        <Text style={styles.loginText}>

                            ¿Ya tienes cuenta?
                            <Text style={styles.loginLink}>
                                {" "}Inicia sesión
                            </Text>

                        </Text>

                    </TouchableOpacity>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24,
    },

    logoContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 30,
    },

    logo: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 22,
    },

    logoText: {
        color: COLORS.white,
        fontSize: 30,
        fontWeight: "bold",
    },

    title: {
        fontSize: 32,
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
        borderRadius: 28,
        padding: 24,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,

        elevation: 3,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: COLORS.text,
    },

    input: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 16,
    },

    errorText: {
        color: "#EF4444",
        marginBottom: 14,
        fontSize: 14,
        fontWeight: "500",
    },

    loginText: {
        textAlign: "center",
        marginTop: 22,
        color: COLORS.subtitle,
    },

    loginLink: {
        color: COLORS.primary,
        fontWeight: "bold",
    },
});