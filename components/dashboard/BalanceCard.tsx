import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

export default function BalanceCard() {

    return (

        <View style={styles.card}>

            <Text style={styles.label}>
                Balance general
            </Text>

            <Text style={styles.balance}>
                +S/ 155
            </Text>

            <View style={styles.divider} />

            <View style={styles.row}>

                <View style={styles.item}>

                    <Text style={styles.itemLabel}>
                        Te deben
                    </Text>

                    <Text style={styles.positive}>
                        +S/ 350
                    </Text>

                </View>

                <View style={styles.item}>

                    <Text style={styles.itemLabel}>
                        Debes
                    </Text>

                    <Text style={styles.negative}>
                        -S/ 195
                    </Text>

                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: COLORS.primary,
        borderRadius: 32,
        padding: 28,
        marginBottom: 28,

        shadowColor: "#2563EB",
        shadowOpacity: 0.25,
        shadowRadius: 14,

        elevation: 6,
    },

    label: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 16,
    },

    balance: {
        color: COLORS.white,
        fontSize: 46,
        fontWeight: "bold",
        marginTop: 12,
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.15)",
        marginVertical: 24,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    item: {
        flex: 1,
    },

    itemLabel: {
        color: "rgba(255,255,255,0.75)",
        marginBottom: 8,
        fontSize: 15,
    },

    positive: {
        color: "#BBF7D0",
        fontSize: 24,
        fontWeight: "bold",
    },

    negative: {
        color: "#FECACA",
        fontSize: 24,
        fontWeight: "bold",
    },
});