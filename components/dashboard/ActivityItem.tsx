import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {

    title: string;
    subtitle: string;
    amount: string;
    positive?: boolean;
};

export default function ActivityItem({

                                         title,
                                         subtitle,
                                         amount,
                                         positive = false,

                                     }: Props) {

    return (

        <View style={styles.container}>

            <View style={styles.leftSection}>

                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor:
                                positive
                                    ? "#DCFCE7"
                                    : "#DBEAFE"
                        }
                    ]}
                >
                    <Text style={styles.icon}>
                        {positive ? "↘" : "↗"}
                    </Text>
                </View>

                <View>

                    <Text style={styles.title}>
                        {title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>

                </View>

            </View>

            <Text
                style={[
                    styles.amount,
                    {
                        color:
                            positive
                                ? "#10B981"
                                : COLORS.text
                    }
                ]}
            >
                {amount}
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        marginBottom: 20,
    },

    leftSection: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    icon: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2563EB",
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: COLORS.subtitle,
    },

    amount: {
        fontSize: 18,
        fontWeight: "bold",
    },
});