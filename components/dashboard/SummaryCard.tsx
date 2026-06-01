import { View, Text, StyleSheet, Animated } from "react-native";
import { useRef, useEffect } from "react";

type Props = {
    title: string;
    amount: string;
    color: string;
    background: string;
    percent: string;
    icon?: string;
};

export default function SummaryCard({ title, amount, color, background, percent, icon = "↗" }: Props) {
    const scaleAnim = useRef(new Animated.Value(0.94)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
    }, [opacityAnim, scaleAnim]);

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: background, borderColor: `${color}30` },
                { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            {/* Círculo decorativo de fondo */}
            <View style={[styles.bgCircle, { backgroundColor: `${color}10` }]} />

            <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
                    <Text style={[styles.iconText, { color }]}>{icon}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
                    <Text style={[styles.badgeText, { color }]}>{percent}</Text>
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.amount, { color }]} numberOfLines={1} adjustsFontSizeToFit>
                {amount}
            </Text>

            {/* Barra decorativa inferior */}
            <View style={[styles.bottomBar, { backgroundColor: `${color}25` }]}>
                <View style={[styles.bottomBarFill, { backgroundColor: color, width: "60%" }]} />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 26, padding: 22, marginBottom: 16,
        borderWidth: 1, overflow: "hidden", position: "relative",
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 3,
    },
    bgCircle: {
        position: "absolute", width: 140, height: 140,
        borderRadius: 70, bottom: -40, right: -30,
    },
    topRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20,
    },
    iconBox: {
        width: 50, height: 50, borderRadius: 16,
        justifyContent: "center", alignItems: "center",
    },
    iconText: { fontSize: 22, fontWeight: "700" },
    badge: {
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 999, alignSelf: "flex-start",
    },
    badgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.2 },
    title: {
        fontSize: 13, fontWeight: "600", color: "#6B7280",
        letterSpacing: 0.3, marginBottom: 6, textTransform: "uppercase",
    },
    amount: {
        fontSize: 38, fontWeight: "800", letterSpacing: -1, marginBottom: 18,
    },
    bottomBar: {
        height: 4, borderRadius: 4, overflow: "hidden",
    },
    bottomBarFill: {
        height: "100%", borderRadius: 4,
    },
});
