import { StyleSheet, View } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";

type Props = {
    intensity?: "soft" | "medium";
};

export default function AmbientScreenBackground({ intensity = "soft" }: Props) {
    const alpha = intensity === "medium" ? 1 : 0.76;
    const { isDark } = useTheme();

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[
                styles.topCurve,
                isDark && styles.topCurveDark,
                { opacity: alpha },
            ]} />
            <View style={[
                styles.leftCurve,
                isDark && styles.leftCurveDark,
                { opacity: alpha },
            ]} />
            <View style={[
                styles.bottomCurve,
                isDark && styles.bottomCurveDark,
                { opacity: alpha },
            ]} />
            <View style={[styles.softBand, isDark && styles.softBandDark]} />
        </View>
    );
}

const styles = StyleSheet.create({
    topCurve: {
        position: "absolute",
        top: -92,
        right: -112,
        width: 310,
        height: 310,
        borderRadius: 155,
        backgroundColor: "rgba(37,99,235,0.12)",
    },

    topCurveDark: {
        backgroundColor: "rgba(59,130,246,0.16)",
    },

    leftCurve: {
        position: "absolute",
        top: 300,
        left: -116,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "rgba(14,165,233,0.075)",
    },

    leftCurveDark: {
        backgroundColor: "rgba(14,165,233,0.10)",
    },

    bottomCurve: {
        position: "absolute",
        bottom: 80,
        right: -132,
        width: 285,
        height: 285,
        borderRadius: 143,
        backgroundColor: "rgba(99,102,241,0.06)",
    },

    bottomCurveDark: {
        backgroundColor: "rgba(96,165,250,0.08)",
    },

    softBand: {
        position: "absolute",
        top: 500,
        right: -80,
        width: 280,
        height: 86,
        borderRadius: 34,
        backgroundColor: "rgba(219,234,254,0.42)",
        transform: [{ rotate: "-11deg" }],
    },

    softBandDark: {
        backgroundColor: "rgba(30,64,175,0.16)",
    },
});
