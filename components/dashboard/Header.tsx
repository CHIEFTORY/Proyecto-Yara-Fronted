import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
} from "react-native";

import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";

type Props = {
    name: string;
};

export default function Header({ name }: Props) {

    const firstName = name.split(" ")[0];
    const initials = name
        ?.split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.greeting}>Hola, {firstName}</Text>
                <Text style={styles.subtitle}>Tus finanzas al día</Text>
            </View>

            <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={() => router.push("/profile")}
                activeOpacity={0.8}
            >
                {/* Anillo exterior */}
                <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                </View>
                {/* Dot verde online */}
                <View style={styles.onlineDot} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
    },

    greeting: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: -0.4,
    },

    subtitle: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 5,
        fontWeight: "500",
    },

    avatarWrapper: {
        position: "relative",
    },

    avatarRing: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: "rgba(37,99,235,0.1)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(37,99,235,0.2)",
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.5,
    },

    onlineDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: "#4ADE80",
        borderWidth: 2.5,
        borderColor: "#F0F4FF",
    },
});
