import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {

    name: string;
    lastActivity: string;
    miBalance: number;
    color: string;

    onPress?: () => void;
};

export default function GroupCard({

                                      name,
                                      lastActivity,
                                      miBalance,
                                      color,
                                      onPress,

                                  }: Props) {


    return (

        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={onPress}
        >

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

                <View style={styles.infoContainer}>

                    <Text style={styles.name}>
                        {name}
                    </Text>

                    <Text style={styles.activity}>
                        {lastActivity}
                    </Text>

                </View>

            </View>

            <View style={styles.rightSection}>

                {
                    miBalance === 0 ? (

                        <Text style={styles.balanceNeutral}>
                            Sin balances
                        </Text>

                    ) : (

                        <>

                            <Text
                                style={[
                                    styles.amount,
                                    {
                                        color:
                                            miBalance > 0
                                                ? "#10B981"
                                                : "#EF4444"
                                    }
                                ]}
                            >

                                {
                                    miBalance > 0
                                        ? `+S/ ${Math.abs(miBalance)}`
                                        : `-S/ ${Math.abs(miBalance)}`
                                }

                            </Text>

                            <Text style={styles.status}>

                                {
                                    miBalance > 0
                                        ? "Recibes"
                                        : "Debes"
                                }

                            </Text>

                        </>

                    )
                }

            </View>

        </TouchableOpacity>
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
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    leftSection: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
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

    infoContainer: {
        flex: 1,
    },

    name: {
        fontSize: 19,
        fontWeight: "700",
        color: COLORS.text,
    },

    activity: {
        marginTop: 6,
        color: COLORS.subtitle,
        fontSize: 14,
    },

    rightSection: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginLeft: 12,
    },

    amount: {
        fontSize: 22,
        fontWeight: "bold",
    },

    status: {
        marginTop: 4,
        color: COLORS.subtitle,
        fontSize: 13,
    },

    emptyText: {
        color: COLORS.subtitle,
        fontSize: 13,
        textAlign: "right",
        maxWidth: 100,
        lineHeight: 18,
    },

    balanceText: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 6,
    },

    balanceNeutral: {
        fontSize: 13,
        color: COLORS.subtitle,
        marginTop: 6,
    },
});