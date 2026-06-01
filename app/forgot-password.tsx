import { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { confirmPasswordReset, requestPasswordReset } from "@/src/services/authService";
import { COLORS } from "@/src/styles/colors";

export default function ForgotPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>();
    const initialEmail = useMemo(
        () => typeof params.email === "string" ? params.email : "",
        [params.email]
    );

    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const sendCode = async () => {
        if (!emailRegex.test(email.trim())) {
            setError("Ingresa un correo valido");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");
            await requestPasswordReset(email.trim());
            setStep("code");
            setMessage("Si el correo existe, enviamos un codigo de recuperacion.");
        } catch (err: any) {
            setError(err?.response?.data?.mensaje || "No se pudo enviar el codigo");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (otp.trim().length !== 6) {
            setError("Ingresa el codigo de 6 digitos");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener minimo 6 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await confirmPasswordReset(email.trim(), otp.trim(), newPassword);
            router.replace({
                pathname: "/login",
                params: { email: email.trim() },
            });
        } catch (err: any) {
            setError(err?.response?.data?.mensaje || "Codigo invalido o expirado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#1E293B" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="key-outline" size={30} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Recuperar contraseña</Text>
                        <Text style={styles.subtitle}>
                            {step === "email"
                                ? "Te enviaremos un codigo seguro para crear una nueva contraseña."
                                : "Revisa tu correo e ingresa el codigo que recibiste."}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.stepRow}>
                            <View style={[styles.stepDot, styles.stepDotActive]}>
                                <Text style={styles.stepText}>1</Text>
                            </View>
                            <View style={styles.stepLine} />
                            <View style={[styles.stepDot, step === "code" && styles.stepDotActive]}>
                                <Text style={[styles.stepText, step !== "code" && styles.stepTextMuted]}>2</Text>
                            </View>
                        </View>

                        <Text style={styles.label}>Correo electronico</Text>
                        <View style={[styles.inputWrapper, step === "code" && styles.inputWrapperDisabled]}>
                            <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                            <TextInput
                                placeholder="tu@email.com"
                                placeholderTextColor="#CBD5E1"
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    setError("");
                                    setMessage("");
                                }}
                                editable={step === "email" && !loading}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        {step === "code" ? (
                            <>
                                <Text style={styles.label}>Codigo recibido</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="123456"
                                        placeholderTextColor="#CBD5E1"
                                        value={otp}
                                        onChangeText={(value) => {
                                            setOtp(value.replace(/\D/g, "").slice(0, 6));
                                            setError("");
                                        }}
                                        keyboardType="number-pad"
                                        style={styles.input}
                                        maxLength={6}
                                    />
                                </View>

                                <Text style={styles.label}>Nueva contraseña</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="Minimo 6 caracteres"
                                        placeholderTextColor="#CBD5E1"
                                        value={newPassword}
                                        onChangeText={(value) => {
                                            setNewPassword(value);
                                            setError("");
                                        }}
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>Confirmar contraseña</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        placeholder="Repite tu contraseña"
                                        placeholderTextColor="#CBD5E1"
                                        value={confirmPassword}
                                        onChangeText={(value) => {
                                            setConfirmPassword(value);
                                            setError("");
                                        }}
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                    />
                                </View>
                            </>
                        ) : null}

                        {message ? (
                            <View style={styles.messageBox}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#047857" />
                                <Text style={styles.messageText}>{message}</Text>
                            </View>
                        ) : null}

                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.buttonDisabled]}
                            onPress={step === "email" ? sendCode : resetPassword}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>
                                        {step === "email" ? "Enviar codigo" : "Actualizar contraseña"}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        {step === "code" ? (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={sendCode}
                                disabled={loading}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.secondaryButtonText}>Reenviar codigo</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
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
    flex: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 30,
        justifyContent: "center",
    },
    backButton: {
        position: "absolute",
        top: 22,
        left: 24,
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        zIndex: 2,
    },
    header: {
        alignItems: "center",
        marginBottom: 28,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1E293B",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        color: "#64748B",
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        maxWidth: 320,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 26,
        elevation: 8,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    stepDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    stepDotActive: {
        backgroundColor: COLORS.primary,
    },
    stepText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 13,
    },
    stepTextMuted: {
        color: "#64748B",
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: "#E2E8F0",
        marginHorizontal: 10,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 9,
        marginTop: 14,
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
    inputWrapperDisabled: {
        opacity: 0.78,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        color: "#1E293B",
        fontWeight: "500",
        fontSize: 15,
    },
    messageBox: {
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#ECFDF5",
        borderColor: "#BBF7D0",
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginTop: 18,
    },
    messageText: {
        flex: 1,
        color: "#047857",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    errorBox: {
        flexDirection: "row",
        gap: 8,
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginTop: 18,
    },
    errorText: {
        flex: 1,
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    primaryButton: {
        marginTop: 22,
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 16,
    },
    secondaryButton: {
        marginTop: 14,
        alignItems: "center",
        padding: 12,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 14,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
