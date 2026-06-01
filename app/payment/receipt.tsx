import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { getPaymentHistory } from "@/src/services/paymentDebtService";
import { COLORS } from "@/src/styles/colors";

const STATUS: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    CONFIRMADO: { label: "Pago confirmado", color: "#15803D", bg: "#DCFCE7", icon: "checkmark-circle" },
    PENDIENTE: { label: "Esperando confirmacion", color: "#B45309", bg: "#FEF3C7", icon: "time" },
    FALLIDO: { label: "Pago no recibido", color: "#B91C1C", bg: "#FEE2E2", icon: "close-circle" },
};

export default function ReceiptScreen() {
    const { paymentId, returnTo } = useLocalSearchParams();
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadReceipt = useCallback(async () => {
        try {
            setErrorMessage("");
            const history = await getPaymentHistory();
            const found = history.find((item: any) => String(item.id) === String(paymentId));

            if (!found) {
                setErrorMessage("No encontramos este recibo en tu historial.");
                return;
            }

            setPayment(found);
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message
                || "No pudimos cargar el recibo."
            );
        } finally {
            setLoading(false);
        }
    }, [paymentId]);

    useEffect(() => {
        loadReceipt();
    }, [loadReceipt]);

    const status = STATUS[payment?.estado] || {
        label: payment?.estado || "Pago",
        color: "#475569",
        bg: "#E2E8F0",
        icon: "ellipse" as keyof typeof Ionicons.glyphMap,
    };
    const backTarget =
        returnTo === "historyDashboard"
            ? "/payment/history?returnTo=dashboard"
            : returnTo === "paymentDashboard"
                ? "/payment?returnTo=dashboard"
                : returnTo === "payment"
                    ? "/payment"
                    : "/payment/history";
    const handleBack = () => {
        if (returnTo === "activity" && router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(backTarget as any);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerLabel}>RECIBO</Text>
                    <Text style={styles.headerTitle}>Pago #{paymentId}</Text>
                </View>
                <View style={styles.headerButton}>
                    <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
                </View>
            </View>

            {loading ? (
                <View style={styles.state}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.stateTitle}>Cargando recibo</Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.state}>
                    <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
                    <Text style={styles.stateTitle}>No se pudo cargar</Text>
                    <Text style={styles.stateText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadReceipt}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.receiptCard}>
                        <View style={styles.receiptTop}>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                <Ionicons name={status.icon} size={16} color={status.color} />
                                <Text style={[styles.statusText, { color: status.color }]}>
                                    {status.label}
                                </Text>
                            </View>
                            <Text style={styles.receiptCode}>#{payment.id}</Text>
                        </View>

                        {payment.estado === "FALLIDO" && (
                            <View style={styles.statusNoticeRejected}>
                                <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
                                <Text style={styles.statusNoticeRejectedText}>
                                    Este pago fue marcado como no recibido. La deuda sigue pendiente hasta registrar un pago confirmado.
                                </Text>
                            </View>
                        )}

                        {payment.estado === "PENDIENTE" && (
                            <View style={styles.statusNoticePending}>
                                <Ionicons name="time-outline" size={18} color="#B45309" />
                                <Text style={styles.statusNoticePendingText}>
                                    Este pago espera confirmación del destinatario. El balance se actualiza cuando sea aceptado.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.amountLabel}>Monto</Text>
                        <Text style={styles.amount}>S/ {Number(payment.monto || 0).toFixed(2)}</Text>

                        <View style={styles.divider} />

                        <ReceiptRow label="Paga" value={payment.deudor} icon="arrow-up-circle-outline" />
                        <ReceiptRow label="Recibe" value={payment.acreedor} icon="arrow-down-circle-outline" />
                        <ReceiptRow label="Grupo" value={payment.grupoNombre || "Sin grupo"} icon="people-outline" />
                        <ReceiptRow label="Metodo" value={payment.metodoPago || "Transferencia"} icon={methodIcon(payment.metodoTransferencia)} />
                        <ReceiptRow label="Fecha" value={formatDateTime(payment.fecha)} icon="calendar-outline" />
                    </View>

                    {payment.grupoId && (
                        <TouchableOpacity
                            style={styles.groupButton}
                            onPress={() => router.push(`/groups/${payment.grupoId}` as any)}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="people-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.groupButtonText}>Ver grupo</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

function ReceiptRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View style={styles.row}>
            <View style={styles.rowIcon}>
                <Ionicons name={icon} size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
            </View>
        </View>
    );
}

function methodIcon(method?: string): keyof typeof Ionicons.glyphMap {
    if (method === "BANCO") return "business-outline";
    if (method === "PLIN") return "phone-portrait-outline";
    if (method === "YAPE") return "phone-portrait-outline";
    return "card-outline";
}

function formatDateTime(value?: string) {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";

    return date.toLocaleString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
        paddingTop: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        alignItems: "center",
    },
    headerLabel: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "900",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 18,
        paddingBottom: 110,
    },
    state: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
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
        marginTop: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    retryText: {
        color: "#FFFFFF",
        fontWeight: "800",
    },
    receiptCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    receiptTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 26,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
    },
    statusNoticeRejected: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 9,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 16,
        padding: 12,
        marginTop: -10,
        marginBottom: 22,
    },
    statusNoticeRejectedText: {
        flex: 1,
        color: "#991B1B",
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "700",
    },
    statusNoticePending: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 9,
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 16,
        padding: 12,
        marginTop: -10,
        marginBottom: 22,
    },
    statusNoticePendingText: {
        flex: 1,
        color: "#92400E",
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "700",
    },
    receiptCode: {
        color: "#94A3B8",
        fontSize: 13,
        fontWeight: "900",
    },
    amountLabel: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 4,
    },
    amount: {
        color: "#0F172A",
        fontSize: 44,
        fontWeight: "900",
    },
    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 22,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    rowText: {
        flex: 1,
        minWidth: 0,
    },
    rowLabel: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "800",
        marginBottom: 2,
    },
    rowValue: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "800",
    },
    groupButton: {
        height: 54,
        borderRadius: 17,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
    },
    groupButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },
});
