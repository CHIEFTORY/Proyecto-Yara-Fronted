import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    balanceGeneral: number;
    totalDebes: number;
    totalTeDeben: number;
};

export default function BalanceCard({
    balanceGeneral,
    totalDebes,
    totalTeDeben,
}: Props) {
    const positive = balanceGeneral >= 0;
    const slideY = useRef(new Animated.Value(14)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const totalMovement = totalTeDeben + totalDebes;
    const receivablePercent = totalMovement > 0
        ? Math.max(8, Math.min(92, (totalTeDeben / totalMovement) * 100))
        : 50;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideY, { toValue: 0, duration: 420, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        ]).start();
    }, [opacity, slideY]);

    return (
        <Animated.View style={[styles.card, { opacity, transform: [{ translateY: slideY }] }]}>
            <View style={styles.bgAccentTop} />
            <View style={styles.bgAccentBottom} />

            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.eyebrow}>BALANCE GENERAL</Text>
                    <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
                        {positive ? "+" : "-"}S/ {Math.abs(balanceGeneral).toFixed(2)}
                    </Text>
                </View>

                <View style={[styles.statusBadge, positive ? styles.statusPositive : styles.statusNegative]}>
                    <Ionicons
                        name={positive ? "checkmark-circle-outline" : "alert-circle-outline"}
                        size={15}
                        color={positive ? "#047857" : "#DC2626"}
                    />
                    <Text style={styles.statusText}>
                        {positive ? "Al dia" : "Pendiente"}
                    </Text>
                </View>
            </View>

            <View style={styles.progressBlock}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressReceive, { width: `${receivablePercent}%` }]} />
                    <View style={styles.progressDebt} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Te deben</Text>
                    <Text style={styles.progressLabel}>Debes</Text>
                </View>
            </View>

            <View style={styles.metricsRow}>
                <Metric
                    icon="arrow-down-circle-outline"
                    label="Te deben"
                    value={`S/ ${Number(totalTeDeben).toFixed(2)}`}
                    color="#BBF7D0"
                    background="rgba(236,253,245,0.16)"
                />
                <Metric
                    icon="arrow-up-circle-outline"
                    label="Debes"
                    value={`S/ ${Number(totalDebes).toFixed(2)}`}
                    color="#FECACA"
                    background="rgba(254,242,242,0.16)"
                />
            </View>
        </Animated.View>
    );
}

function Metric({
    icon,
    label,
    value,
    color,
    background,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    color: string;
    background: string;
}) {
    return (
        <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: background }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1D4ED8",
        borderRadius: 26,
        padding: 20,
        marginBottom: 24,
        overflow: "hidden",
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.28,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    bgAccentTop: {
        position: "absolute",
        top: -80,
        right: -70,
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: "rgba(255,255,255,0.13)",
    },
    bgAccentBottom: {
        position: "absolute",
        bottom: -70,
        left: -60,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(15,23,42,0.13)",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 14,
        marginBottom: 18,
    },
    eyebrow: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0,
        marginBottom: 6,
    },
    balance: {
        color: "#FFFFFF",
        fontSize: 38,
        fontWeight: "900",
        letterSpacing: 0,
    },
    statusBadge: {
        minHeight: 32,
        borderRadius: 999,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
    },
    statusPositive: {
        backgroundColor: "rgba(236,253,245,0.18)",
        borderColor: "rgba(187,247,208,0.32)",
    },
    statusNegative: {
        backgroundColor: "rgba(254,242,242,0.18)",
        borderColor: "rgba(254,202,202,0.34)",
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "900",
    },
    progressBlock: {
        backgroundColor: "rgba(255,255,255,0.13)",
        borderRadius: 18,
        padding: 13,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(254,226,226,0.35)",
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: 8,
    },
    progressReceive: {
        height: "100%",
        backgroundColor: "#86EFAC",
    },
    progressDebt: {
        flex: 1,
        backgroundColor: "#FCA5A5",
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressLabel: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 11,
        fontWeight: "800",
    },
    metricsRow: {
        flexDirection: "row",
        gap: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 11,
    },
    metricLabel: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 3,
    },
    metricValue: {
        fontSize: 17,
        fontWeight: "900",
        letterSpacing: 0,
    },
});
