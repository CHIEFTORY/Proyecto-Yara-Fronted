import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Animated,
    Image,
} from "react-native";

import { api } from "@/src/services/api";
import { getToken } from "@/src/utils/authStorage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BRAND_DARK = "#082E74";
const BRAND_BLUE = "#2563EB";
const BRAND_SOFT = "#EAF2FF";
const DANGER = "#EF4444";

export default function ServerDownScreen() {

    const [checking, setChecking] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [nextRetry, setNextRetry] = useState(6);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardY = useRef(new Animated.Value(22)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scanAnim = useRef(new Animated.Value(0)).current;

    const handleRetry = useCallback(async (silent = false) => {
        try {
            setChecking(true);
            setAttempts((current) => current + 1);
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
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 520,
                useNativeDriver: true,
            }),
            Animated.spring(cardY, {
                toValue: 0,
                friction: 8,
                tension: 58,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1400,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1400,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, {
                    toValue: 1,
                    duration: 1900,
                    useNativeDriver: true,
                }),
                Animated.timing(scanAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [cardY, fadeAnim, pulseAnim, scanAnim]);

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

    const scanTranslate = scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-120, 120],
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BRAND_DARK} />

            <View style={styles.background}>
                <View style={styles.glowTop} />
                <View style={styles.glowBottom} />
                <View style={styles.gridLineA} />
                <View style={styles.gridLineB} />
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: cardY }],
                    },
                ]}
            >
                <View style={styles.brandRow}>
                    <Image
                        source={require("@/assets/images/yara-adaptive-foreground-final.png")}
                        style={styles.brandMark}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.brandName}>Yara</Text>
                        <Text style={styles.brandSub}>Estado del servicio</Text>
                    </View>
                </View>

                <View style={styles.statusCard}>
                    <View style={styles.scanWindow}>
                        <Animated.View
                            style={[
                                styles.scanBeam,
                                { transform: [{ translateX: scanTranslate }] },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.statusIcon,
                                { transform: [{ scale: pulseAnim }] },
                            ]}
                        >
                            <Ionicons name="cloud-offline-outline" size={36} color="#FFFFFF" />
                        </Animated.View>
                    </View>

                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusPillText}>Conexion interrumpida</Text>
                    </View>

                    <Text style={styles.title}>No podemos conectar con Yara</Text>
                    <Text style={styles.subtitle}>
                        Puede ser una pausa breve del backend, un deploy en Railway o una conexion inestable. Seguiremos intentando por ti.
                    </Text>

                    <View style={styles.retryPanel}>
                        <View style={styles.retryPanelLeft}>
                            <Ionicons name="time-outline" size={20} color={BRAND_BLUE} />
                            <View>
                                <Text style={styles.retryPanelLabel}>Reintento automatico</Text>
                                <Text style={styles.retryPanelValue}>
                                    En {nextRetry}s
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.attemptBadge}>
                            {attempts === 0 ? "Listo" : `${attempts} intento${attempts === 1 ? "" : "s"}`}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.retryButton, checking && styles.retryButtonDisabled]}
                        disabled={checking}
                        onPress={() => handleRetry()}
                        activeOpacity={0.88}
                    >
                        {checking ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#FFFFFF" size="small" />
                                <Text style={styles.retryText}>Verificando servicio</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.retryText}>Reintentar ahora</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.diagnosticsCard}>
                    <Text style={styles.diagnosticsTitle}>Chequeo rapido</Text>
                    <DiagnosticRow
                        icon="wifi-outline"
                        title="Internet del dispositivo"
                        text="Confirma que tienes datos o Wi-Fi activo."
                    />
                    <DiagnosticRow
                        icon="server-outline"
                        title="Backend en Railway"
                        text="Si acaba de desplegar, puede tardar unos segundos."
                    />
                    <DiagnosticRow
                        icon="shield-checkmark-outline"
                        title="Sesion protegida"
                        text="Cuando vuelva el servicio, te llevaremos a tu cuenta."
                    />
                </View>
            </Animated.View>
        </View>
    );
}

function DiagnosticRow({
    icon,
    title,
    text,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    text: string;
}) {
    return (
        <View style={styles.diagnosticRow}>
            <View style={styles.diagnosticIcon}>
                <Ionicons name={icon} size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.diagnosticBody}>
                <Text style={styles.diagnosticTitle}>{title}</Text>
                <Text style={styles.diagnosticText}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: BRAND_DARK,
    },

    background: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
    },

    glowTop: {
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: "rgba(37,99,235,0.58)",
        top: -120,
        right: -120,
    },

    glowBottom: {
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(125,211,252,0.20)",
        bottom: -90,
        left: -100,
    },

    gridLineA: {
        position: "absolute",
        width: 1,
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.07)",
        left: "18%",
    },

    gridLineB: {
        position: "absolute",
        width: "100%",
        height: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        top: "18%",
    },

    content: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 56,
        paddingBottom: 28,
        justifyContent: "center",
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
    },

    brandMark: {
        width: 44,
        height: 44,
    },

    brandName: {
        color: "#FFFFFF",
        fontSize: 21,
        fontWeight: "900",
    },

    brandSub: {
        color: "rgba(255,255,255,0.64)",
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
    },

    statusCard: {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 30,
        padding: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.7)",
        shadowColor: "#000000",
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 32,
        elevation: 12,
    },

    scanWindow: {
        height: 116,
        borderRadius: 24,
        backgroundColor: BRAND_DARK,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },

    scanBeam: {
        position: "absolute",
        width: 90,
        height: 180,
        backgroundColor: "rgba(125,211,252,0.22)",
        transform: [{ rotate: "18deg" }],
    },

    statusIcon: {
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: DANGER,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 6,
        borderColor: "rgba(255,255,255,0.18)",
    },

    statusPill: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FEF2F2",
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#FECACA",
        marginBottom: 14,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: DANGER,
    },

    statusPillText: {
        color: "#B91C1C",
        fontSize: 12,
        fontWeight: "900",
    },

    title: {
        color: "#0F172A",
        fontSize: 28,
        fontWeight: "900",
        lineHeight: 34,
        marginBottom: 10,
    },

    subtitle: {
        color: "#64748B",
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "600",
        marginBottom: 18,
    },

    retryPanel: {
        backgroundColor: BRAND_SOFT,
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    retryPanelLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },

    retryPanelLabel: {
        color: "#1E3A8A",
        fontSize: 12,
        fontWeight: "800",
    },

    retryPanelValue: {
        color: BRAND_BLUE,
        fontSize: 18,
        fontWeight: "900",
        marginTop: 2,
    },

    attemptBadge: {
        color: "#475569",
        fontSize: 12,
        fontWeight: "900",
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 10,
        overflow: "hidden",
    },

    retryButton: {
        backgroundColor: BRAND_BLUE,
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: BRAND_BLUE,
        shadowOpacity: 0.32,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 8,
    },

    retryButtonDisabled: {
        opacity: 0.7,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },

    retryText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },

    diagnosticsCard: {
        marginTop: 16,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },

    diagnosticsTitle: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
        marginBottom: 12,
    },

    diagnosticRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 10,
    },

    diagnosticIcon: {
        width: 34,
        height: 34,
        borderRadius: 13,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    diagnosticBody: {
        flex: 1,
    },

    diagnosticTitle: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
        marginBottom: 3,
    },

    diagnosticText: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "600",
    },
});
