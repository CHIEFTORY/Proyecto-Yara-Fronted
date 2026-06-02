import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    Animated,
    RefreshControl,
    Platform,
} from "react-native";

import {
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";

import { COLORS } from "@/src/styles/colors";
import {
    confirmPayment,
    rejectPayment,
} from "@/src/services/paymentDebtService";
import { api } from "@/src/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { emitAppEvent, useAppRefresh } from "@/src/utils/appEvents";

const AVATAR_COLORS = [
    { bg: "#DBEAFE", text: "#2563EB" },
    { bg: "#DCFCE7", text: "#16A34A" },
    { bg: "#EDE9FE", text: "#7C3AED" },
    { bg: "#FEF3C7", text: "#D97706" },
    { bg: "#FCE7F3", text: "#DB2777" },
    { bg: "#CFFAFE", text: "#0891B2" },
];

export default function ConfirmationsScreen() {
    const { returnTo } = useLocalSearchParams();
    const shouldReturnToDashboard = returnTo === "dashboard";

    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const loadData = useCallback(async () => {
        try {
            setErrorMessage("");
            const response = await api.get("/pagos/pending-confirmation?limit=30");
            setPayments(response.data);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
            ]).start();
        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
            setErrorMessage(
                error.response?.data?.message
                || "No pudimos cargar los pagos pendientes. Revisa tu conexion e intenta otra vez."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fadeAnim, slideAnim]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const returnToDashboard = () => {
        if (shouldReturnToDashboard) {
            router.replace("/(tabs)" as any);
            return;
        }

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace("/(tabs)" as any);
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    useAppRefresh(["payments", "activity"], loadData);

    const handleConfirm = async (paymentId: number, deudor: string, monto: number) => {
        if (Platform.OS === "web") {
            try {
                await confirmPayment(paymentId);
                emitAppEvent("payments", "activity", "badge", "dashboard", "group");
                loadData();
            } catch {
                Alert.alert("Error", "No se pudo confirmar el pago.");
            }
            return;
        }

        Alert.alert(
            "Confirmar pago",
            `¿Confirmas que recibiste S/ ${Number(monto).toFixed(2)} de ${deudor}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, lo recibí",
                    onPress: async () => {
                        try {
                            await confirmPayment(paymentId);
                            emitAppEvent("payments", "activity", "badge", "dashboard", "group");
                            Alert.alert("Confirmado", "El pago fue registrado como recibido.");
                            loadData();
                        } catch {
                            Alert.alert("Error", "No se pudo confirmar el pago.");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (paymentId: number, deudor: string, monto: number) => {
        const runReject = async () => {
            try {
                await rejectPayment(paymentId);
                emitAppEvent("payments", "activity", "badge", "dashboard", "group");
                loadData();
            } catch {
                Alert.alert("Error", "No se pudo rechazar el pago.");
            }
        };

        if (Platform.OS === "web") {
            await runReject();
            return;
        }

        Alert.alert(
            "Pago no recibido",
            `¿Seguro que no recibiste S/ ${Number(monto).toFixed(2)} de ${deudor}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "No lo recibí",
                    style: "destructive",
                    onPress: runReject,
                },
            ]
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.deco1} />
                <View style={styles.deco2} />

                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={returnToDashboard}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Confirmar pagos</Text>
                    <View style={{ width: 42 }} />
                </View>

                {/* Stats en el header */}
                <View style={styles.headerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{payments.length}</Text>
                        <Text style={styles.statLabel}>
                            {payments.length === 1 ? "pago pendiente" : "pagos pendientes"}
                        </Text>
                    </View>
                    {payments.length > 0 && (
                        <>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    S/ {payments.reduce((acc, p) => acc + Number(p.monto || 0), 0).toFixed(2)}
                                </Text>
                                <Text style={styles.statLabel}>total a confirmar</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    { paddingBottom: 120 },
                    payments.length === 0 && styles.emptyScrollContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >

                {loading ? (
                    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="hourglass-outline" size={48} color={COLORS.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>Cargando pagos</Text>
                        <Text style={styles.emptySubtitle}>Estamos revisando los pagos por confirmar.</Text>
                    </Animated.View>
                ) : errorMessage ? (
                    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                        <View style={[styles.emptyIconBox, styles.errorIconBox]}>
                            <Ionicons name="cloud-offline-outline" size={48} color="#DC2626" />
                        </View>
                        <Text style={styles.emptyTitle}>No se pudo cargar</Text>
                        <Text style={styles.emptySubtitle}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadData}
                            activeOpacity={0.82}
                        >
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : payments.length === 0 ? (
                    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="checkmark-circle" size={52} color="#16A34A" />
                        </View>
                        <Text style={styles.emptyTitle}>¡Todo al día!</Text>
                        <Text style={styles.emptySubtitle}>
                            No tienes pagos pendientes por confirmar. Cuando alguien te pague aparecerá aquí.
                        </Text>
                    </Animated.View>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Info banner */}
                        <View style={styles.infoBanner}>
                            <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" style={styles.infoBannerIcon} />
                            <Text style={styles.infoBannerText}>
                                Confirma solo si realmente recibiste el dinero. Esto liquidará la deuda.
                            </Text>
                        </View>

                        {payments.map((payment, index) => {
                            const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            const method = payment.metodoPago || "Transferencia";
                            const methodTheme = getPaymentMethodTheme(payment.metodoTransferencia, method);
                            return (
                                <View key={payment.id} style={styles.card}>

                                    {/* Franja lateral verde */}
                                    <View style={[styles.cardAccent, { backgroundColor: methodTheme.color }]} />

                                    {/* Top row */}
                                    <View style={styles.cardTopRow}>
                                        <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
                                            <Text style={[styles.avatarText, { color: palette.text }]}>
                                                {payment.deudor?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>

                                        <View style={styles.cardInfo}>
                                            <Text style={styles.deudorName}>{payment.deudor}</Text>
                                            <View style={styles.subtitleRow}>
                                                <View style={[
                                                    styles.methodBadge,
                                                    { backgroundColor: methodTheme.bg },
                                                ]}>
                                                    <Text style={[
                                                        styles.methodBadgeText,
                                                        { color: methodTheme.color },
                                                    ]}>
                                                        {method}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardSubtitle}>
                                                {payment.grupoNombre
                                                    ? `Grupo: ${payment.grupoNombre}`
                                                    : "Pago pendiente de confirmacion"}
                                            </Text>
                                            <Text style={styles.cardDate}>
                                                {payment.fecha
                                                    ? formatPaymentDate(payment.fecha)
                                                    : "Fecha no disponible"}
                                            </Text>
                                        </View>

                                        {/* Monto */}
                                        <View style={styles.amountBox}>
                                            <Text style={styles.amountValue}>
                                                S/ {Number(payment.monto).toFixed(2)}
                                            </Text>
                                            <Text style={styles.amountLabel}>recibido</Text>
                                        </View>
                                    </View>

                                    {/* Confirmar */}
                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={() => handleConfirm(payment.id, payment.deudor, payment.monto)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="checkmark-circle" size={20} color="white" />
                                        <Text style={styles.confirmButtonText}>Sí, lo recibí</Text>
                                    </TouchableOpacity>

                                    {/* Rechazar */}
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => handleReject(payment.id, payment.deudor, payment.monto)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.rejectButtonText}>No lo recibí</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

function getPaymentMethodTheme(
    metodoTransferencia?: string,
    metodoPago?: string
) {
    const value = `${metodoTransferencia || metodoPago || ""}`.toUpperCase();

    if (value.includes("PLIN")) {
        return {
            color: "#0891B2",
            bg: "#CFFAFE",
        };
    }

    if (value.includes("BANCO") || value.includes("CUENTA")) {
        return {
            color: "#334155",
            bg: "#E2E8F0",
        };
    }

    if (value.includes("YAPE")) {
        return {
            color: "#7C3AED",
            bg: "#EDE9FE",
        };
    }

    return {
        color: COLORS.primary,
        bg: "#DBEAFE",
    };
}

function formatPaymentDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return date.toLocaleString("es-PE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    /* Header */
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: 28,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: "hidden",
        position: "relative",
    },

    deco1: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
        top: -70,
        right: -50,
    },

    deco2: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: -30,
        left: 20,
    },

    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        zIndex: 2,
    },

    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    backArrow: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    headerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.2,
    },

    headerStats: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 0,
        zIndex: 2,
    },

    statItem: {
        flex: 1,
        alignItems: "center",
    },

    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },

    statLabel: {
        fontSize: 11,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "600",
        marginTop: 3,
    },

    statDivider: {
        width: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginVertical: 4,
    },

    /* Scroll */
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    emptyScrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },

    /* Info banner */
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EFF6FF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },

    infoBannerIcon: {
        fontSize: 15,
        marginTop: 1,
    },

    infoBannerText: {
        flex: 1,
        color: "#1D4ED8",
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "600",
    },

    /* Payment card */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 14,
        elevation: 3,
        overflow: "hidden",
        position: "relative",
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        backgroundColor: "#16A34A",
        borderTopLeftRadius: 28,
        borderBottomLeftRadius: 28,
    },

    cardTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 18,
        paddingLeft: 8,
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        flexShrink: 0,
    },

    avatarText: {
        fontSize: 22,
        fontWeight: "800",
    },

    cardInfo: {
        flex: 1,
    },

    deudorName: {
        fontSize: 17,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 6,
        letterSpacing: -0.2,
    },

    subtitleRow: {
        flexDirection: "row",
        marginBottom: 4,
    },

    methodBadge: {
        backgroundColor: "#F3E8FF",
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 10,
    },

    methodBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#7C3AED",
    },

    cardSubtitle: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "500",
        marginTop: 4,
    },

    cardDate: {
        fontSize: 11,
        color: "#64748B",
        fontWeight: "700",
        marginTop: 5,
    },

    amountBox: {
        alignItems: "flex-end",
        marginLeft: 10,
    },

    amountValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#16A34A",
        letterSpacing: -0.5,
    },

    amountLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "600",
        marginTop: 2,
    },

    /* Botones */
    confirmButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 10,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 5,
    },

    confirmButtonText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 15,
    },

    rejectButton: {
        backgroundColor: "#FEF2F2",
        borderRadius: 18,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    rejectButtonText: {
        color: "#DC2626",
        fontWeight: "700",
        fontSize: 14,
    },

    /* Empty */
    emptyState: {
        alignItems: "center",
        paddingHorizontal: 24,
    },

    emptyIconBox: {
        width: 96,
        height: 96,
        borderRadius: 32,
        backgroundColor: "#F0FDF4",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: "#BBF7D0",
    },

    errorIconBox: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
    },

    emptyTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 10,
    },

    emptySubtitle: {
        fontSize: 15,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 24,
        fontWeight: "500",
    },

    retryButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },

    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },
});

