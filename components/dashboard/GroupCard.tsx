import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {

    name: string;
    members: string;
    amount: string;
    color: string;
};

export default function GroupCard({

                                      name,
                                      members,
                                      amount,
                                      color,

                                  }: Props) {

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

                    <Text style={styles.members}>
                        {members}
                    </Text>

                </View>

            </View>

            <Text
                style={[
                    styles.amount,
                    {
                        color:
                            amount.includes("+")
                                ? "#10B981"
                                : "#EF4444"
                    }
                ]}
            >
                {amount}
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 22,
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
        alignItems: "center",
    },

    iconContainer: {
        width: 56,
        height: 56,
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
        fontWeight: "600",
        color: COLORS.text,
    },

    members: {
        marginTop: 4,
        color: COLORS.subtitle,
        fontSize: 14,
    },

    amount: {
        fontSize: 20,
        fontWeight: "bold",
    },
});