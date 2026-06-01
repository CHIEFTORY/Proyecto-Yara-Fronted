import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Animated,
} from "react-native";

import { api } from "@/src/services/api";
import { getToken } from "@/src/utils/authStorage";
import { useCallback, useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";

export default function ServerDownScreen() {

    const [checking, setChecking] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [nextRetry, setNextRetry] = useState(6);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleRetry = useCallback(async (silent = false) => {
        try {
            setChecking(true);
            setAttempts(a => a + 1);
            await api.get("/health");
            const token = await getToken();
            router.replace((token ? "/(tabs)" : "/login") as any);
        } catch (error) {
            if (!silent) console.log(error);
        } finally {
            setNextRetry(6);
            setChecking(false);
        }
    }, []);

    useEffect(() => {
        /* Fade in al montar */
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        /* Pulso suave en el ícono */
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
            ])
        ).start();
    }, [fadeAnim, pulseAnim]);

    useEffect(() => {
        if (checking) return;

        const interval = setInterval(() => {
            setNextRetry((current) => {
                if (current <= 1) {
                    handleRetry(true);
                    return 6;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [checking, handleRetry]);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            {/* Círculos decorativos */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.bgCircle3} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

                {/* Ícono animado */}
                <Animated.View
                    style={[styles.iconBox, { transform: [{ scale: pulseAnim }] }]}
                >
                    <Ionicons
                        name="cloud-offline-outline"
                        size={64}
                        color="#EF4444"
                    />
                </Animated.View>

                {/* Texto principal */}
                <Text style={styles.title}>Sin conexión</Text>
                <Text style={styles.subtitle}>
                    No pudimos conectar con Yara. Si Railway acaba de desplegar, esto suele durar unos segundos.
                </Text>

                {/* Chips de posibles causas */}
                <View style={styles.causesRow}>
                    {["Deploy activo", "Sin internet", "Timeout"].map((cause) => (
                        <View key={cause} style={styles.causePill}>
                            <Text style={styles.causePillText}>{cause}</Text>
                        </View>
                    ))}
                </View>

                {/* Contador de intentos */}
                {attempts > 0 && (
                    <View style={styles.attemptsBanner}>
                        <Text style={styles.attemptsBannerText}>
                            {attempts === 1
                                ? "Primer intento fallido. Sigo reintentando automáticamente."
                                : `${attempts} intentos fallidos. Reintento automático activo.`
                            }
                        </Text>
                    </View>
                )}

                <View style={styles.autoRetryBox}>
                    <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.autoRetryText}>
                        Próximo reintento en {nextRetry}s
                    </Text>
                </View>

                {/* Botón reintentar */}
                <TouchableOpacity
                    style={[styles.retryButton, checking && styles.retryButtonDisabled]}
                    disabled={checking}
                    onPress={() => handleRetry()}
                    activeOpacity={0.85}
                >
                    {checking ? (
                        <View style={styles.retryContent}>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={styles.retryText}>Verificando...</Text>
                        </View>
                    ) : (
                        <View style={styles.retryContent}>
                            <Ionicons name="refresh-outline" size={20} color="white" />
                            <Text style={styles.retryText}>Reintentar ahora</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Tip */}
                <View style={styles.tipBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#2563EB" style={styles.tipIcon} />
                    <Text style={styles.tipText}>
                        Puedes dejar esta pantalla abierta. Cuando el backend responda, volveremos al inicio.
                    </Text>
                </View>

            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
        justifyContent: "center",
        alignItems: "center",
    },

    /* Decoraciones */
    bgCircle1: {
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(239,68,68,0.06)",
        top: -60,
        right: -80,
    },

    bgCircle2: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(239,68,68,0.04)",
        bottom: 40,
        left: -50,
    },

    bgCircle3: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(37,99,235,0.05)",
        bottom: 200,
        right: 20,
    },

    content: {
        alignItems: "center",
        paddingHorizontal: 32,
        width: "100%",
    },

    /* Ícono */
    iconBox: {
        width: 130,
        height: 130,
        borderRadius: 40,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        borderWidth: 1.5,
        borderColor: "#FECACA",
        shadowColor: "#EF4444",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 6,
    },

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: -0.5,
        marginBottom: 12,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 15,
        lineHeight: 24,
        color: "#64748B",
        textAlign: "center",
        fontWeight: "500",
        marginBottom: 24,
    },

    /* Causas */
    causesRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 28,
    },

    causePill: {
        backgroundColor: "#FEF2F2",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    causePillText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#DC2626",
    },

    /* Intentos */
    attemptsBanner: {
        backgroundColor: "#FFFBEB",
        borderRadius: 14,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FDE68A",
        width: "100%",
    },

    attemptsBannerText: {
        fontSize: 13,
        color: "#92400E",
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 20,
    },

    /* Botón */
    autoRetryBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#DBEAFE",
        width: "100%",
    },

    autoRetryText: {
        color: "#475569",
        fontSize: 13,
        fontWeight: "700",
    },

    retryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 36,
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
        width: "100%",
    },

    retryButtonDisabled: {
        opacity: 0.65,
    },

    retryContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },

    retryText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },

    /* Tip */
    tipBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EFF6FF",
        borderRadius: 16,
        padding: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        width: "100%",
    },

    tipIcon: {
        fontSize: 15,
        marginTop: 1,
    },

    tipText: {
        flex: 1,
        fontSize: 13,
        color: "#1D4ED8",
        lineHeight: 20,
        fontWeight: "600",
    },
});
