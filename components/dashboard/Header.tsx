import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

export default function Header() {

    return (

        <View style={styles.container}>

            <View>

                <Text style={styles.title}>
                    Hola, Juan 👋
                </Text>

                <Text style={styles.subtitle}>
                    Aquí está el resumen de tus gastos
                </Text>

            </View>

            <View style={styles.avatar}>

                <Text style={styles.avatarText}>
                    JP
                </Text>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 30,
        marginBottom: 30,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: COLORS.text,
    },

    subtitle: {
        fontSize: 16,
        color: COLORS.subtitle,
        marginTop: 6,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 16,
    },
});