import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";

type Props = {
    name: string;
    lastActivity: string;
    miBalance: number;
    color: string;
    onPress?: () => void;
};

export default function GroupCard({ name, lastActivity, miBalance, color, onPress }: Props) {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    const positivo = miBalance > 0;
    const neutral  = miBalance === 0;

    const initial = name?.charAt(0)?.toUpperCase() || "G";

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: isDark ? "#1E293B" : "#F1F5F9",
                        shadowOpacity: isDark ? 0.18 : 0.08,
                    },
                ]}
                activeOpacity={1}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                {/* Avatar con inicial */}
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                    <View style={[
                        styles.emojiOverlay,
                        {
                            backgroundColor: colors.card,
                            borderColor: isDark ? "#1E293B" : "#F1F5F9",
                        },
                    ]}>
                        <Ionicons name="people-outline" size={13} color={colors.primary} />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
                    <Text style={[styles.activity, { color: colors.subtitle }]} numberOfLines={1}>{lastActivity}</Text>
                </View>

                {/* Balance */}
                <View style={styles.balanceCol}>
                    {neutral ? (
                            <View style={[
                                styles.neutralPill,
                                { backgroundColor: isDark ? "#111827" : "#F1F5F9" },
                            ]}>
                            <Text style={[styles.neutralText, { color: colors.subtitle }]}>Al dia</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.amount, { color: positivo ? "#10B981" : "#EF4444" }]}>
                                {positivo ? "+" : "-"}S/ {Math.abs(miBalance).toFixed(2)}
                            </Text>
                            <View style={[styles.statusPill, { backgroundColor: positivo ? "#DCFCE7" : "#FEE2E2" }]}>
                                <Text style={[styles.statusPillText, { color: positivo ? "#059669" : "#DC2626" }]}>
                                    {positivo ? "Recibes" : "Debes"}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <Ionicons name="chevron-forward" size={18} color={isDark ? "#475569" : "#CBD5E1"} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14,
        marginBottom: 12, flexDirection: "row", alignItems: "center",
        borderWidth: 1, borderColor: "#F1F5F9", gap: 12,
        shadowColor: "#94A3B8", shadowOpacity: 0.08,
        shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
    },
    avatar: {
        width: 54, height: 54, borderRadius: 18,
        justifyContent: "center", alignItems: "center",
        position: "relative", flexShrink: 0,
    },
    avatarText: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
    emojiOverlay: {
        position: "absolute", bottom: -4, right: -4,
        width: 22, height: 22, borderRadius: 7,
        backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center",
        borderWidth: 1.5, borderColor: "#F1F5F9",
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: "700", color: "#111827", letterSpacing: 0 },
    activity: { marginTop: 4, fontSize: 12, color: "#94A3B8", fontWeight: "500" },
    balanceCol: { alignItems: "flex-end", gap: 4, flexShrink: 0 },
    amount: { fontSize: 17, fontWeight: "800", letterSpacing: 0 },
    statusPill: {
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 999, alignSelf: "flex-end",
    },
    statusPillText: { fontSize: 11, fontWeight: "700" },
    neutralPill: {
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 999, backgroundColor: "#F1F5F9",
    },
    neutralText: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
});
