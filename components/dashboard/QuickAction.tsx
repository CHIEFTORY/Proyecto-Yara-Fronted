import {
    Text,
    TouchableOpacity,
    StyleSheet,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress?: () => void;
};

export default function QuickAction({
    title,
    icon,
    color,
    onPress,
}: Props) {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.82}
        >
            <View style={styles.iconWrapper}>
                <Ionicons name={icon} size={24} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 118,
        minHeight: 92,
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        gap: 9,
        shadowColor: "#0F172A",
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 7 },
        shadowRadius: 14,
        elevation: 4,
    },

    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontSize: 12,
        fontWeight: "900",
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 16,
    },
});
