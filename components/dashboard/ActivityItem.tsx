import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";

type Props = {
    title: string;
    subtitle: string;
    amount?: string;
    time: string;
    positive?: boolean;
    onPress?: () => void;
};

export default function ActivityItem({ title, subtitle, amount, time, positive = false, onPress }: Props) {
    const iconName  = positive ? "arrow-down" : "arrow-up";
    const iconColor = positive ? "#10B981" : "#2563EB";
    const iconBg    = positive ? "#DCFCE7" : "#DBEAFE";

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.78}
        >

            {/* Línea de tiempo lateral */}
            <View style={styles.timelineCol}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <Ionicons name={iconName} size={18} color={iconColor} />
                </View>
                <View style={styles.timelineLine} />
            </View>

            {/* Contenido */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {amount && (
                        <Text style={[styles.amount, { color: positive ? "#10B981" : COLORS.text }]}>
                            {amount}
                        </Text>
                    )}
                </View>
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                <Text style={styles.time}>{time}</Text>
            </View>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 4,
        gap: 12,
    },
    timelineCol: {
        alignItems: "center",
        width: 44,
        flexShrink: 0,
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 15,
        justifyContent: "center", alignItems: "center",
    },
    timelineLine: {
        flex: 1, width: 1.5,
        backgroundColor: "#F1F5F9",
        marginTop: 4, minHeight: 16,
    },
    content: {
        flex: 1, paddingTop: 2, paddingBottom: 18,
    },
    topRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", gap: 8,
    },
    title: {
        fontSize: 15, fontWeight: "700", color: COLORS.text,
        flex: 1, lineHeight: 22, letterSpacing: -0.1,
    },
    amount: {
        fontSize: 16, fontWeight: "800",
        letterSpacing: -0.3, flexShrink: 0,
    },
    subtitle: {
        marginTop: 4, fontSize: 13,
        fontWeight: "500", color: "#64748B",
    },
    time: {
        marginTop: 4, fontSize: 11,
        color: "#CBD5E1", fontWeight: "600",
    },
});
