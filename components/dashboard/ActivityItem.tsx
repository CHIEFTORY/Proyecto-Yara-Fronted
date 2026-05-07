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
    time: string;
    positive?: boolean;
};

export default function ActivityItem({

                                         title,
                                         subtitle,
                                         amount,
                                         time,
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
                    <Text
                        style={[
                            styles.icon,
                            {
                                color:
                                    positive
                                        ? "#10B981"
                                        : "#2563EB"
                            }
                        ]}
                    >
                        {positive ? "↓" : "↑"}
                    </Text>
                </View>

                <View>

                    <Text style={styles.title}>
                        {title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>

                    <Text style={styles.time}>
                        {time}
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

        paddingVertical: 14,

        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },

    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    icon: {
        fontSize: 24,
        fontWeight: "bold",
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

    time: {
        marginTop: 4,
        fontSize: 12,
        color: "#9CA3AF",
    },

    amount: {
        fontSize: 18,
        fontWeight: "bold",
    },
});