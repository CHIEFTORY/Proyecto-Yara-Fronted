import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
} from "react-native";

import {
    useState,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    COLORS,
} from "@/src/styles/colors";
import { Ionicons } from "@expo/vector-icons";

import {
    getPendingPayments,
    getMyPendingSentPayments,
} from "@/src/services/paymentDebtService";

const getPreferredCollectionMethod = (deuda: any) => {
    const methods = Array.isArray(deuda.metodosCobro)
        ? deuda.metodosCobro
        : [];

    return methods.find((method: any) => method.predeterminado)
        || methods[0]
        || (deuda.yapeNumero
            ? {
                tipo: "YAPE",
                alias: "Yape",
                numeroTelefono: deuda.yapeNumero,
            }
            : null);
};

const getCollectionMethodText = (deuda: any) => {
    const method = getPreferredCollectionMethod(deuda);

    if (!method) return "Sin método";
    if (method.tipo === "BANCO") return method.bancoNombre || "Cuenta bancaria";
    return `${method.alias || method.tipo} ${method.numeroTelefono || ""}`.trim();
};

const buildPayDebtRoute = (deuda: any, returnParam: string) => {
    const methods = encodeURIComponent(JSON.stringify(
        Array.isArray(deuda.metodosCobro) ? deuda.metodosCobro : []
    ));
    const yape = deuda.yapeNumero
        ? `&yapeNumero=${encodeURIComponent(String(deuda.yapeNumero))}`
        : "";

    return `/groups/${deuda.grupoId}/pay-debt?deudorId=${deuda.deudorId}&acreedorId=${deuda.acreedorId}&monto=${deuda.monto}${yape}&metodosCobro=${methods}${returnParam}`;
};

export default function PaymentsScreen() {
    const { returnTo } = useLocalSearchParams();
    const shouldReturnToDashboard = returnTo === "dashboard";

    const [deudas, setDeudas] =
        useState<any[]>([]);

    const [sentPayments, setSentPayments] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);
    const [errorMessage, setErrorMessage] =
        useState("");
    const [viewFilter, setViewFilter] =
        useState<"PENDING" | "SENT">("PENDING");
    const [selectedGroup, setSelectedGroup] =
        useState("ALL");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const loadData = useCallback(async () => {
        try {
            setErrorMessage("");
            const [data, sentData] = await Promise.all([
                getPendingPayments(),
                getMyPendingSentPayments(),
            ]);
            setDeudas(data);
            setSentPayments(sentData);
        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
            setErrorMessage(
                error.response?.data?.message
                || "No pudimos cargar tus pagos. Revisa tu conexion e intenta otra vez."
            );
        } finally {
            setLoading(false);
            animateIn();
        }
    }, [animateIn]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const total = deudas.reduce(
        (acc, item) => acc + Number(item.monto),
        0
    );

    const cantidadAcreedores = new Set(deudas.map(d => d.acreedorId)).size;
    const groups = useMemo(
        () => Array.from(
            new Map(
                deudas
                    .filter((deuda) => deuda.grupoId)
                    .map((deuda) => [
                        String(deuda.grupoId),
                        deuda.grupoNombre || deuda.grupo || `Grupo ${deuda.grupoId}`,
                    ])
            )
        ),
        [deudas]
    );
    const filteredDebts = useMemo(
        () => selectedGroup === "ALL"
            ? deudas
            : deudas.filter((deuda) => String(deuda.grupoId) === selectedGroup),
        [deudas, selectedGroup]
    );
    const visibleSentPayments = useMemo(
        () => selectedGroup === "ALL"
            ? sentPayments
            : sentPayments.filter((payment) => String(payment.grupoId) === selectedGroup),
        [sentPayments, selectedGroup]
    );

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

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Header premium con gradiente */}
            <View style={styles.header}>

                {/* Botón volver */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={returnToDashboard}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerLabel}>RESUMEN</Text>
                    <Text style={styles.headerTitle}>Pagar pendientes</Text>
                </View>

                {/* Decoración circular */}
                <View style={styles.headerCircle1} />
                <View style={styles.headerCircle2} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Card total principal */}
                    <View style={styles.totalCard}>
                        <View style={styles.totalLeft}>
                            <Text style={styles.totalLabel}>Total a pagar</Text>
                            <Text style={styles.totalAmount}>
                                S/ {total.toFixed(2)}
                            </Text>
                            <View style={styles.totalBadgesRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {deudas.length} {deudas.length === 1 ? "deuda" : "deudas"}
                                    </Text>
                                </View>
                                {cantidadAcreedores > 0 && (
                                    <View style={[styles.badge, styles.badgeAlt]}>
                                        <Text style={styles.badgeText}>
                                            {cantidadAcreedores} {cantidadAcreedores === 1 ? "persona" : "personas"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.totalIconContainer}>
                            <Ionicons name="card-outline" size={30} color="#FFFFFF" />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => router.push(
                            shouldReturnToDashboard
                                ? "/payment/history?returnTo=dashboard"
                                : "/payment/history" as any
                        )}
                        activeOpacity={0.85}
                    >
                        <View style={styles.historyIconBox}>
                            <Ionicons name="receipt-outline" size={19} color={COLORS.primary} />
                        </View>
                        <View style={styles.historyTextBox}>
                            <Text style={styles.historyTitle}>Historial y recibos</Text>
                            <Text style={styles.historySubtitle}>Revisa pagos enviados, recibidos y pendientes</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>

                    <View style={styles.filterTabs}>
                        <TouchableOpacity
                            style={[styles.filterTab, viewFilter === "PENDING" && styles.filterTabActive]}
                            onPress={() => setViewFilter("PENDING")}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.filterTabText, viewFilter === "PENDING" && styles.filterTabTextActive]}>
                                Por pagar
                            </Text>
                            {deudas.length > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{deudas.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterTab, viewFilter === "SENT" && styles.filterTabActive]}
                            onPress={() => setViewFilter("SENT")}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.filterTabText, viewFilter === "SENT" && styles.filterTabTextActive]}>
                                Enviados
                            </Text>
                            {sentPayments.length > 0 && (
                                <View style={[styles.filterBadge, styles.filterBadgeWarning]}>
                                    <Text style={styles.filterBadgeText}>{sentPayments.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {groups.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.groupFilters}
                        >
                            <TouchableOpacity
                                style={[styles.groupFilterChip, selectedGroup === "ALL" && styles.groupFilterChipActive]}
                                onPress={() => setSelectedGroup("ALL")}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.groupFilterText, selectedGroup === "ALL" && styles.groupFilterTextActive]}>
                                    Todos
                                </Text>
                            </TouchableOpacity>
                            {groups.map(([groupId, groupName]) => (
                                <TouchableOpacity
                                    key={groupId}
                                    style={[styles.groupFilterChip, selectedGroup === groupId && styles.groupFilterChipActive]}
                                    onPress={() => setSelectedGroup(groupId)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.groupFilterText, selectedGroup === groupId && styles.groupFilterTextActive]}>
                                        {groupName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {loading ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="hourglass-outline" size={42} color="#94A3B8" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>Cargando pagos</Text>
                            <Text style={styles.emptySubtitle}>
                                Estamos revisando tus deudas y pagos pendientes.
                            </Text>
                        </View>
                    ) : errorMessage ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="alert-circle-outline" size={42} color="#DC2626" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No se pudo cargar</Text>
                            <Text style={styles.emptySubtitle}>{errorMessage}</Text>
                            <TouchableOpacity
                                style={styles.emptyAction}
                                onPress={loadData}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyActionText}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : viewFilter === "PENDING" && filteredDebts.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="checkmark-circle-outline" size={42} color="#16A34A" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>¡Estás al día!</Text>
                            <Text style={styles.emptySubtitle}>
                                No tienes deudas pendientes por pagar.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyAction}
                                onPress={returnToDashboard}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyActionText}>Volver al inicio</Text>
                            </TouchableOpacity>
                        </View>
                    ) : viewFilter === "PENDING" ? (
                        <View>
                            <Text style={styles.listTitle}>Deudas pendientes</Text>

                            {filteredDebts.map((deuda, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.debtCard}
                                    onPress={() => {
                                        const returnParam = shouldReturnToDashboard
                                            ? "&returnTo=paymentDashboard"
                                            : "&returnTo=payment";

                                        router.push(buildPayDebtRoute(deuda, returnParam) as any);
                                    }}
                                    activeOpacity={0.75}
                                >
                                    {/* Avatar inicial */}
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarLetter}>
                                            {deuda.acreedor?.[0]?.toUpperCase() || "?"}
                                        </Text>
                                    </View>

                                    <View style={styles.debtInfo}>
                                        <Text style={styles.debtTitle}>
                                            {deuda.acreedor}
                                        </Text>
                                        <Text style={styles.debtGroupText}>
                                            {deuda.grupoNombre || deuda.grupo || "Grupo compartido"}
                                        </Text>
                                        <View style={styles.debtMeta}>
                                            <View style={[
                                                styles.yapeBadge,
                                                !getPreferredCollectionMethod(deuda) && styles.yapeBadgeInactive
                                            ]}>
                                                <Text style={styles.yapeBadgeText}>
                                                    {getCollectionMethodText(deuda)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.debtRight}>
                                        <Text style={styles.debtAmount}>
                                            S/ {Number(deuda.monto).toFixed(2)}
                                        </Text>
                                        <View style={styles.payNowChip}>
                                            <Text style={styles.payNowText}>Pagar</Text>
                                            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {/* Botón pagar todo */}
                            {filteredDebts.length > 1 && (
                                <View style={styles.payAllHint}>
                                    <Text style={styles.payAllText}>
                                        Selecciona cada deuda para pagarla individualmente
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : visibleSentPayments.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="time-outline" size={42} color="#D97706" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>Sin pagos enviados</Text>
                            <Text style={styles.emptySubtitle}>
                                Los pagos pendientes de confirmación aparecerán aquí. Si un pago no es recibido, volverás a verlo en tu historial.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.sentSectionInline}>
                            <Text style={styles.listTitle}>Esperando confirmacion</Text>
                            {visibleSentPayments.map((payment) => (
                                <TouchableOpacity
                                    key={payment.id}
                                    style={styles.sentCard}
                                    onPress={() => router.push({
                                        pathname: "/payment/receipt",
                                        params: {
                                            paymentId: String(payment.id),
                                            ...(shouldReturnToDashboard ? { returnTo: "paymentDashboard" } : { returnTo: "payment" }),
                                        },
                                    })}
                                    activeOpacity={0.82}
                                >
                                    <View style={styles.sentIconBox}>
                                        <Ionicons name="time-outline" size={20} color="#D97706" />
                                    </View>
                                    <View style={styles.debtInfo}>
                                        <Text style={styles.debtTitle}>
                                            Pago enviado a {payment.acreedor}
                                        </Text>
                                        <Text style={styles.sentSubtitle}>
                                            {payment.grupoNombre || "Grupo"} - {payment.metodoPago || "Transferencia"}
                                        </Text>
                                        <View style={styles.pendingChip}>
                                            <Text style={styles.pendingChipText}>Pendiente de confirmacion</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.sentAmount}>
                                        S/ {Number(payment.monto).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {viewFilter === "PENDING" && sentPayments.length > 0 && (
                        <View style={styles.sentSection}>
                            <Text style={styles.listTitle}>Esperando confirmación</Text>
                            {sentPayments.map((payment) => (
                                <View key={payment.id} style={styles.sentCard}>
                                    <View style={styles.sentIconBox}>
                                        <Ionicons name="time-outline" size={20} color="#D97706" />
                                    </View>
                                    <View style={styles.debtInfo}>
                                        <Text style={styles.debtTitle}>
                                            Pago enviado a {payment.acreedor}
                                        </Text>
                                        <Text style={styles.sentSubtitle}>
                                            Cuando lo confirme, esta deuda quedará liquidada.
                                        </Text>
                                    </View>
                                    <Text style={styles.sentAmount}>
                                        S/ {Number(payment.monto).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: 36,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        overflow: "hidden",
        position: "relative",
    },

    headerCircle1: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.07)",
        top: -60,
        right: -40,
    },

    headerCircle2: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: -30,
        right: 60,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },

    backArrow: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    headerContent: {
        zIndex: 1,
    },

    headerLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.6)",
        letterSpacing: 2,
        marginBottom: 6,
    },

    headerTitle: {
        fontSize: 30,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },

    /* ── SCROLL ── */
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    /* ── TOTAL CARD ── */
    totalCard: {
        backgroundColor: "#1E293B",
        borderRadius: 28,
        padding: 26,
        marginBottom: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#1E293B",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 10,
    },

    totalLeft: {
        flex: 1,
    },

    totalLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.55)",
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 6,
    },

    totalAmount: {
        fontSize: 42,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -1,
        marginBottom: 14,
    },

    totalBadgesRow: {
        flexDirection: "row",
        gap: 8,
    },

    badge: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },

    badgeAlt: {
        backgroundColor: "rgba(99,179,237,0.2)",
    },

    badgeText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
        fontWeight: "600",
    },

    totalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 16,
    },

    totalIcon: {
        fontSize: 30,
    },

    historyButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 16,
        marginBottom: 22,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    },

    historyIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    historyIcon: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: "900",
    },

    historyTextBox: {
        flex: 1,
    },

    historyTitle: {
        color: "#1E293B",
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 3,
    },

    historySubtitle: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 17,
    },

    historyArrow: {
        color: "#CBD5E1",
        fontSize: 18,
        fontWeight: "900",
        marginLeft: 10,
    },

    /* ── LISTA ── */
    filterTabs: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        borderRadius: 18,
        padding: 5,
        gap: 6,
        marginBottom: 12,
    },

    filterTab: {
        flex: 1,
        height: 44,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
    },

    filterTabActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },

    filterTabText: {
        color: "#64748B",
        fontSize: 13,
        fontWeight: "800",
    },

    filterTabTextActive: {
        color: "#0F172A",
    },

    filterBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 6,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    filterBadgeWarning: {
        backgroundColor: "#F59E0B",
    },

    filterBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "900",
    },

    groupFilters: {
        gap: 8,
        paddingBottom: 14,
    },

    groupFilterChip: {
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        paddingVertical: 9,
    },

    groupFilterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    groupFilterText: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "800",
    },

    groupFilterTextActive: {
        color: "#FFFFFF",
    },

    listTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 14,
        letterSpacing: -0.3,
    },

    debtCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },

    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    avatarLetter: {
        fontSize: 20,
        fontWeight: "800",
        color: COLORS.primary,
    },

    debtInfo: {
        flex: 1,
    },

    debtTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 6,
    },

    debtGroupText: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 6,
    },

    debtMeta: {
        flexDirection: "row",
    },

    yapeBadge: {
        backgroundColor: "#F0FDF4",
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },

    yapeBadgeInactive: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
    },

    yapeBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#15803D",
    },

    debtRight: {
        alignItems: "flex-end",
        gap: 8,
        marginLeft: 12,
    },

    debtAmount: {
        fontSize: 20,
        fontWeight: "800",
        color: "#DC2626",
        letterSpacing: -0.5,
    },

    payNowChip: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },

    payNowText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    /* ── HINT ── */
    payAllHint: {
        backgroundColor: "#EFF6FF",
        borderRadius: 16,
        padding: 16,
        marginTop: 4,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },

    payAllText: {
        fontSize: 13,
        color: "#3B82F6",
        fontWeight: "600",
        lineHeight: 18,
    },

    /* ── EMPTY ── */
    sentSection: {
        marginTop: 24,
    },

    sentSectionInline: {
        marginTop: 4,
    },

    sentCard: {
        backgroundColor: "#FFFBEB",
        borderRadius: 22,
        padding: 18,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FDE68A",
    },

    sentIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF3C7",
        marginRight: 14,
    },

    sentIcon: {
        fontSize: 20,
    },

    sentSubtitle: {
        color: "#92400E",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
        lineHeight: 17,
    },

    sentAmount: {
        color: "#D97706",
        fontSize: 17,
        fontWeight: "800",
        marginLeft: 10,
    },

    pendingChip: {
        alignSelf: "flex-start",
        backgroundColor: "#FEF3C7",
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
        marginTop: 7,
    },

    pendingChipText: {
        color: "#B45309",
        fontSize: 10,
        fontWeight: "900",
    },

    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 48,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    emptyIcon: {
        fontSize: 52,
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 15,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 22,
    },

    emptyAction: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
    },

    emptyActionText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
    },
});
