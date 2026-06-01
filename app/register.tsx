import { useState, useRef } from "react";
import { registerRequest } from "@/src/services/authService";
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
    StatusBar,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import { Ionicons } from "@expo/vector-icons";

type FieldKey = "nombre" | "email" | "telefono" | "password" | "confirmPassword";

export default function RegisterScreen() {

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [focused, setFocused] = useState<FieldKey | null>(null);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shakeError = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    /* Validación en tiempo real */
    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { label: "Débil", color: "#EF4444", width: "33%" };
        if (password.length < 10) return { label: "Media", color: "#F59E0B", width: "66%" };
        return { label: "Fuerte", color: "#16A34A", width: "100%" };
    };

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
    const strength = passwordStrength();

    const handleRegister = async () => {
        if (!nombre || !email || !telefono || !password || !confirmPassword) {
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
        if (password !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            shakeError();
            return;
        }
        if (password.length < 6) {
            setErrorMessage("La contraseña debe tener mínimo 6 caracteres");
            shakeError();
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            await registerRequest(nombre, email, telefono, password);
            Alert.alert(
                "Cuenta creada",
                "Tu cuenta ha sido creada correctamente.",
                [{ text: "Continuar", onPress: () => router.replace("/login") }]
            );
        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.mensaje || "No se pudo registrar el usuario"
            );
            shakeError();
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field: FieldKey) => [
        styles.inputWrapper,
        focused === field && styles.inputFocused,
    ];

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="dark-content" />

            {/* Círculos decorativos de fondo */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── LOGO ── */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoShadow}>
                            <View style={styles.logo}>
                                <Text style={styles.logoText}>Y</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Crear cuenta</Text>
                        <Text style={styles.subtitle}>Empieza a gestionar tus gastos</Text>
                    </View>

                    {/* ── CARD ── */}
                    <Animated.View
                        style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
                    >
                        {/* Nombre */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nombre completo</Text>
                            <View style={inputStyle("nombre")}>
                                <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.fieldIcon} />
                                <TextInput
                                    placeholder="Diego García"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={nombre}
                                    onChangeText={(t) => { setNombre(t); setErrorMessage(""); }}
                                    onFocus={() => setFocused("nombre")}
                                    onBlur={() => setFocused(null)}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <View style={inputStyle("email")}>
                                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.fieldIcon} />
                                <TextInput
                                    placeholder="correo@email.com"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setErrorMessage(""); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused(null)}
                                />
                            </View>
                        </View>

                        {/* Teléfono */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <View style={inputStyle("telefono")}>
                                <Ionicons name="phone-portrait-outline" size={18} color="#94A3B8" style={styles.fieldIcon} />
                                <TextInput
                                    placeholder="999 999 999"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={telefono}
                                    onChangeText={(t) => { setTelefono(t); setErrorMessage(""); }}
                                    keyboardType="phone-pad"
                                    onFocus={() => setFocused("telefono")}
                                    onBlur={() => setFocused(null)}
                                />
                            </View>
                        </View>

                        {/* Contraseña */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={inputStyle("password")}>
                                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.fieldIcon} />
                                <TextInput
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor="#CBD5E1"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setErrorMessage(""); }}
                                    onFocus={() => setFocused("password")}
                                    onBlur={() => setFocused(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            {/* Barra de fortaleza */}
                            {strength && (
                                <View style={styles.strengthRow}>
                                    <View style={styles.strengthBarBg}>
                                        <View style={[
                                            styles.strengthBarFill,
                                            { width: strength.width as any, backgroundColor: strength.color }
                                        ]} />
                                    </View>
                                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                        {strength.label}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Confirmar contraseña */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirmar contraseña</Text>
                            <View style={[
                                inputStyle("confirmPassword"),
                                passwordsMatch && styles.inputSuccess,
                                passwordsMismatch && styles.inputError,
                            ]}>
                                <Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" style={styles.fieldIcon} />
                                <TextInput
                                    placeholder="Repite tu contraseña"
                                    placeholderTextColor="#CBD5E1"
                                    secureTextEntry={!showConfirm}
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={(t) => { setConfirmPassword(t); setErrorMessage(""); }}
                                    onFocus={() => setFocused("confirmPassword")}
                                    onBlur={() => setFocused(null)}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                                {passwordsMatch && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                            </View>
                            {passwordsMismatch && (
                                <Text style={styles.mismatchText}>Las contraseñas no coinciden</Text>
                            )}
                        </View>

                        {/* Error */}
                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        {/* Botón registrar */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Crear cuenta</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                    </View>
                                )
                            }
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>¿ya tienes cuenta?</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Login */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.replace("/login")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
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

    bgCircle1: {
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "rgba(37,99,235,0.06)",
        top: -100,
        right: -80,
    },

    bgCircle2: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(124,58,237,0.05)",
        bottom: 60,
        left: -50,
    },

    scroll: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },

    /* ── LOGO ── */
    logoContainer: {
        alignItems: "center",
        marginBottom: 28,
    },

    logoShadow: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
    },

    logo: {
        width: 74,
        height: 74,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "800",
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: -0.5,
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "500",
    },

    /* ── CARD ── */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        padding: 28,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 28,
        elevation: 8,
    },

    fieldGroup: {
        marginBottom: 18,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        letterSpacing: 0.3,
        marginBottom: 8,
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

    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: "#EFF6FF",
    },

    inputSuccess: {
        borderColor: "#16A34A",
        backgroundColor: "#F0FDF4",
    },

    inputError: {
        borderColor: "#EF4444",
        backgroundColor: "#FFF5F5",
    },

    fieldIcon: {
        fontSize: 16,
    },

    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "500",
    },

    eyeIcon: {
        fontSize: 16,
        padding: 4,
    },

    matchIcon: {
        fontSize: 16,
        color: "#16A34A",
        fontWeight: "800",
    },

    /* Fortaleza contraseña */
    strengthRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 8,
    },

    strengthBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: "#E2E8F0",
        borderRadius: 2,
        overflow: "hidden",
    },

    strengthBarFill: {
        height: 4,
        borderRadius: 2,
    },

    strengthLabel: {
        fontSize: 11,
        fontWeight: "700",
        width: 44,
    },

    mismatchText: {
        fontSize: 12,
        color: "#EF4444",
        fontWeight: "600",
        marginTop: 6,
        marginLeft: 4,
    },

    /* Error box */
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    errorIcon: {
        fontSize: 14,
    },

    errorText: {
        flex: 1,
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "600",
    },

    /* Botones */
    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 18,
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    buttonText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.2,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
    },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 24,
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

    loginButton: {
        backgroundColor: "#F1F5F9",
        borderRadius: 18,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    loginButtonText: {
        color: "#475569",
        fontWeight: "700",
        fontSize: 15,
    },
});
