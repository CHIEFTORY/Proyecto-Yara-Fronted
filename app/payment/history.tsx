import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { getPaymentHistory } from "@/src/services/paymentDebtService";
import { COLORS } from "@/src/styles/colors";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    CONFIRMADO: { label: "Confirmado", color: "#15803D", bg: "#DCFCE7", icon: "checkmark-circle" },
    PENDIENTE: { label: "Pendiente", color: "#B45309", bg: "#FEF3C7", icon: "time" },
    FALLIDO: { label: "No recibido", color: "#B91C1C", bg: "#FEE2E2", icon: "close-circle" },
};

export default function PaymentHistoryScreen() {
    const { returnTo } = useLocalSearchParams();
    const shouldReturnToDashboard = returnTo === "dashboard";
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [groupFilter, setGroupFilter] = useState("ALL");

    const loadHistory = useCallback(async () => {
        try {
            setErrorMessage("");
            setPayments(await getPaymentHistory());
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message
                || "No pudimos cargar tu historial de pagos."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const totalConfirmado = payments
        .filter((payment) => payment.estado === "CONFIRMADO")
        .reduce((acc, payment) => acc + Number(payment.monto || 0), 0);

    const groupOptions = useMemo(
        () => Array.from(
            new Map(
                payments
                    .filter((payment) => payment.grupoId)
                    .map((payment) => [
                        String(payment.grupoId),
                        payment.grupoNombre || `Grupo ${payment.grupoId}`,
                    ])
            )
        ),
        [payments]
    );

    const visiblePayments = useMemo(
        () => payments.filter((payment) => {
            const matchesStatus = statusFilter === "ALL" || payment.estado === statusFilter;
            const matchesGroup = groupFilter === "ALL" || String(payment.grupoId) === groupFilter;

            return matchesStatus && matchesGroup;
        }),
        [groupFilter, payments, statusFilter]
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace(
                        shouldReturnToDashboard
                            ? "/payment?returnTo=dashboard"
                            : "/payment" as any
                    )}
                >
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerLabel}>RECIBOS</Text>
                    <Text style={styles.headerTitle}>Historial de pagos</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Ionicons name="receipt-outline" size={22} color="#FFFFFF" />
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Confirmado histórico</Text>
                    <Text style={styles.summaryAmount}>S/ {totalConfirmado.toFixed(2)}</Text>
                    <Text style={styles.summaryText}>
                        {payments.length} movimiento{payments.length === 1 ? "" : "s"} registrado{payments.length === 1 ? "" : "s"}
                    </Text>
                </View>

                {payments.length > 0 && (
                    <View style={styles.filtersBlock}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterRow}
                        >
                            {[
                                ["ALL", "Todos"],
                                ["CONFIRMADO", "Confirmados"],
                                ["PENDIENTE", "Pendientes"],
                                ["FALLIDO", "No recibidos"],
                            ].map(([value, label]) => (
                                <TouchableOpacity
                                    key={value}
                                    style={[styles.filterChip, statusFilter === value && styles.filterChipActive]}
                                    onPress={() => setStatusFilter(value)}
                                    activeOpacity={0.82}
                                >
                                    <Text style={[styles.filterText, statusFilter === value && styles.filterTextActive]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {groupOptions.length > 1 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterRow}
                            >
                                <TouchableOpacity
                                    style={[styles.filterChip, groupFilter === "ALL" && styles.filterChipActive]}
                                    onPress={() => setGroupFilter("ALL")}
                                    activeOpacity={0.82}
                                >
                                    <Text style={[styles.filterText, groupFilter === "ALL" && styles.filterTextActive]}>
                                        Todos los grupos
                                    </Text>
                                </TouchableOpacity>
                                {groupOptions.map(([groupId, groupName]) => (
                                    <TouchableOpacity
                                        key={groupId}
                                        style={[styles.filterChip, groupFilter === groupId && styles.filterChipActive]}
                                        onPress={() => setGroupFilter(groupId)}
                                        activeOpacity={0.82}
                                    >
                                        <Text style={[styles.filterText, groupFilter === groupId && styles.filterTextActive]}>
                                            {groupName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}

                {loading ? (
                    <View style={styles.stateCard}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={styles.stateTitle}>Cargando historial</Text>
                    </View>
                ) : errorMessage ? (
                    <View style={styles.stateCard}>
                        <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
                        <Text style={styles.stateTitle}>No se pudo cargar</Text>
                        <Text style={styles.stateText}>{errorMessage}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
                            <Text style={styles.retryText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : payments.length === 0 ? (
                    <View style={styles.stateCard}>
                        <Ionicons name="receipt-outline" size={34} color="#94A3B8" />
                        <Text style={styles.stateTitle}>Sin pagos todavía</Text>
                        <Text style={styles.stateText}>
                            Cuando envíes o recibas pagos, aparecerán aquí como recibos.
                        </Text>
                    </View>
                ) : visiblePayments.length === 0 ? (
                    <View style={styles.stateCard}>
                        <Ionicons name="filter-outline" size={34} color="#94A3B8" />
                        <Text style={styles.stateTitle}>Sin resultados</Text>
                        <Text style={styles.stateText}>
                            No hay pagos que coincidan con esos filtros. Prueba con otro estado o grupo.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {visiblePayments.map((payment) => {
                            const status = STATUS_STYLES[payment.estado] || {
                                label: payment.estado || "Pago",
                                color: "#475569",
                                bg: "#E2E8F0",
                                icon: "ellipse" as keyof typeof Ionicons.glyphMap,
                            };

                            return (
                                <TouchableOpacity
                                    key={payment.id}
                                    style={styles.receiptCard}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/payment/receipt",
                                            params: {
                                                paymentId: String(payment.id),
                                                ...(shouldReturnToDashboard ? { returnTo: "historyDashboard" } : { returnTo: "history" }),
                                            },
                                        });
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.receiptTop}>
                                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                            <Ionicons name={status.icon} size={14} color={status.color} />
                                            <Text style={[styles.statusText, { color: status.color }]}>
                                                {status.label}
                                            </Text>
                                        </View>
                                        <Text style={styles.receiptDate}>{formatDate(payment.fecha)}</Text>
                                    </View>

                                    <View style={styles.receiptBody}>
                                        <View style={styles.methodIcon}>
                                            <Ionicons name={methodIcon(payment.metodoTransferencia)} size={20} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.receiptInfo}>
                                            <Text style={styles.receiptTitle}>
                                                {payment.deudor} pago a {payment.acreedor}
                                            </Text>
                                            <Text style={styles.receiptMeta}>
                                                {payment.grupoNombre || "Grupo"} - {payment.metodoPago || "Transferencia"}
                                            </Text>
                                        </View>
                                        <Text style={styles.receiptAmount}>
                                            S/ {Number(payment.monto || 0).toFixed(2)}
                                        </Text>
                                    </View>

                                    <View style={styles.receiptFooter}>
                                        <Text style={styles.receiptCode}>Recibo #{payment.id}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function methodIcon(method?: string): keyof typeof Ionicons.glyphMap {
    if (method === "BANCO") return "business-outline";
    if (method === "PLIN") return "phone-portrait-outline";
    if (method === "YAPE") return "phone-portrait-outline";
    return "card-outline";
}

function formatDate(value?: string) {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";

    return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F4F7FB",
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 28,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerLabel: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 2,
        textAlign: "center",
        marginBottom: 5,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 18,
        paddingBottom: 110,
    },
    summaryCard: {
        backgroundColor: "#111827",
        borderRadius: 24,
        padding: 22,
        marginBottom: 20,
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.58)",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    summaryAmount: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "900",
        marginBottom: 8,
    },
    summaryText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "600",
    },
    filtersBlock: {
        gap: 10,
        marginBottom: 18,
    },
    filterRow: {
        gap: 8,
        paddingRight: 16,
    },
    filterChip: {
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "800",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    stateCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 28,
        alignItems: "center",
        gap: 10,
    },
    stateTitle: {
        color: "#1E293B",
        fontSize: 17,
        fontWeight: "800",
    },
    stateText: {
        color: "#64748B",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 6,
    },
    retryText: {
        color: "#FFFFFF",
        fontWeight: "800",
    },
    list: {
        gap: 12,
    },
    receiptCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    receiptTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },
    receiptDate: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "700",
    },
    receiptBody: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    methodIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    receiptInfo: {
        flex: 1,
        minWidth: 0,
    },
    receiptTitle: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 4,
    },
    receiptMeta: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
    },
    receiptAmount: {
        color: "#0F172A",
        fontSize: 17,
        fontWeight: "900",
    },
    receiptFooter: {
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        marginTop: 14,
        paddingTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    receiptCode: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "800",
    },
});
