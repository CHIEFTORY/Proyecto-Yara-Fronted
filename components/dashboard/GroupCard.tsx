import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {

    name: string;
    lastActivity: string;
    amount: string;
    color: string;
};

export default function GroupCard({

                                      name,
                                      lastActivity,
                                      amount,
                                      color,

                                  }: Props) {

    const positive = amount.includes("+");

    return (

        <View style={styles.card}>

            <View style={styles.leftSection}>

                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: color,
                        }
                    ]}
                >
                    <Text style={styles.icon}>
                        👥
                    </Text>
                </View>

                <View>

                    <Text style={styles.name}>
                        {name}
                    </Text>

                    <Text style={styles.activity}>
                        {lastActivity}
                    </Text>

                    <View style={styles.avatarRow}>

                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                A
                            </Text>
                        </View>

                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                M
                            </Text>
                        </View>

                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                J
                            </Text>
                        </View>

                    </View>

                </View>

            </View>

            <View style={styles.rightSection}>

                <Text
                    style={[
                        styles.amount,
                        {
                            color:
                                positive
                                    ? "#10B981"
                                    : "#EF4444"
                        }
                    ]}
                >
                    {amount}
                </Text>

                <Text style={styles.status}>
                    {positive
                        ? "Te deben"
                        : "Debes"}
                </Text>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,

        flexDirection: "row",
        justifyContent: "space-between",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    leftSection: {
        flexDirection: "row",
        flex: 1,
    },

    iconContainer: {
        width: 58,
        height: 58,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    icon: {
        fontSize: 24,
    },

    name: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.text,
    },

    activity: {
        marginTop: 4,
        color: COLORS.subtitle,
        fontSize: 13,
    },

    avatarRow: {
        flexDirection: "row",
        marginTop: 12,
    },

    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: -8,
        borderWidth: 2,
        borderColor: COLORS.white,
    },

    avatarText: {
        fontSize: 11,
        fontWeight: "bold",
        color: COLORS.text,
    },

    rightSection: {
        alignItems: "flex-end",
        justifyContent: "center",
    },

    amount: {
        fontSize: 22,
        fontWeight: "bold",
    },

    status: {
        marginTop: 6,
        color: COLORS.subtitle,
        fontSize: 13,
    },
});