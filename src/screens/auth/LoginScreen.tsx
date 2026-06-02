import { COLORS } from "@/src/styles/colors";
import { useState, useRef } from "react";
import { loginRequest } from "@/src/services/authService";
import { saveToken } from "@/src/utils/authStorage";
import { savePushToken } from "@/src/services/notificationService";
import { registerForPushNotifications } from "@/src/utils/pushNotifications";

import { router } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

export default function LoginScreen() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shakeError = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage("Completa todos los campos");
            shakeError();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Ingresa un correo válido");
            shakeError();
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const response = await loginRequest(email, password);

            if (response.mfaRequired) {
                setLoading(false);
                return;
            }

            await saveToken(response.token);
            registerForPushNotifications()
                .then((pushToken) => {
                    if (pushToken) {
                        savePushToken(pushToken).catch(console.log);
                    }
                })
                .catch(console.log);
            router.replace("/(tabs)");

        } catch (error: any) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 403 ||
                error.response?.status === 500
            ) {
                setErrorMessage("Correo o contraseña incorrectos");
            } else if (error.response?.status === 429) {
                setErrorMessage("Demasiados intentos. Intenta nuevamente en 1 minuto");
            } else {
                setErrorMessage("No se pudo conectar al servidor");
            }
            shakeError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <AmbientScreenBackground intensity="medium" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── LOGO + TÍTULO ── */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoShadow}>
                            <View style={styles.logo}>
                                <Text style={styles.logoText}>Y</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Bienvenido a Yara</Text>
                        <Text style={styles.subtitle}>Gestiona tus gastos compartidos</Text>
                    </View>

                    {/* ── CARD ── */}
                    <Animated.View
                        style={[
                            styles.card,
                            { transform: [{ translateX: shakeAnim }] }
                        ]}
                    >
                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <View style={[
                                styles.inputWrapper,
                                emailFocused && styles.inputWrapperFocused,
                                errorMessage && styles.inputWrapperError,
                            ]}>
                                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setErrorMessage(""); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                />
                            </View>
                        </View>

                        {/* Contraseña */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Contraseña</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        const query = email ? `?email=${encodeURIComponent(email)}` : "";
                                        router.push(`/forgot-password${query}` as any);
                                    }}
                                >
                                    <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                passFocused && styles.inputWrapperFocused,
                                errorMessage && styles.inputWrapperError,
                            ]}>
                                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Contraseña"
                                    placeholderTextColor="#CBD5E1"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setErrorMessage(""); }}
                                    onFocus={() => setPassFocused(true)}
                                    onBlur={() => setPassFocused(false)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error */}
                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        {/* Botón */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>¿nuevo aquí?</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Registro */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => router.push("/register")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.registerButtonText}>Crear cuenta gratis</Text>
                        </TouchableOpacity>

                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },

    /* ── LOGO ── */
    logoContainer: {
        alignItems: "center",
        marginBottom: 36,
    },

    logoShadow: {
        marginBottom: 22,
    },

    logo: {
        width: 76,
        height: 76,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.34)",
        overflow: "hidden",
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "900",
    },

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: 0,
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 15,
        color: "#94A3B8",
        fontWeight: "500",
    },

    /* ── CARD ── */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        padding: 28,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 28,
        elevation: 8,
    },

    fieldGroup: {
        marginBottom: 20,
    },

    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 10,
        letterSpacing: 0.2,
    },

    forgotText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.primary,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        gap: 10,
    },

    inputWrapperFocused: {
        borderColor: COLORS.primary,
        backgroundColor: "#EFF6FF",
    },

    inputWrapperError: {
        borderColor: "#FCA5A5",
        backgroundColor: "#FFF5F5",
    },

    inputIcon: {
        fontSize: 16,
    },

    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "500",
    },

    eyeBtn: {
        padding: 4,
    },

    eyeIcon: {
        fontSize: 16,
    },

    /* Error */
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    errorIcon: {
        fontSize: 14,
    },

    errorText: {
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
    },

    /* Botón principal */
    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 18,
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.3,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
    },

    /* Divider */
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 28,
        marginBottom: 16,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },

    dividerText: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
    },

    /* Botón registro */
    registerButton: {
        backgroundColor: "#F1F5F9",
        borderRadius: 18,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    registerButtonText: {
        color: "#475569",
        fontWeight: "700",
        fontSize: 15,
    },
});
