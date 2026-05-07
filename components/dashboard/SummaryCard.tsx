import {
    View,
    Text,
    StyleSheet,
} from "react-native";

type Props = {

    title: string;
    amount: string;
    color: string;
    background: string;
    percent: string;
};

export default function SummaryCard({

                                        title,
                                        amount,
                                        color,
                                        background,
                                        percent,

                                    }: Props) {

    return (

        <View
            style={[
                styles.card,
                {
                    backgroundColor: background,
                    borderColor: `${color}40`,
                }
            ]}
        >

            <View style={styles.topRow}>

                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: `${color}20`,
                        }
                    ]}
                >
                    <Text
                        style={[
                            styles.icon,
                            {
                                color,
                            }
                        ]}
                    >
                        ↗
                    </Text>
                </View>

                <View
                    style={[
                        styles.percentBadge,
                        {
                            backgroundColor: `${color}15`,
                        }
                    ]}
                >
                    <Text
                        style={[
                            styles.percentText,
                            {
                                color,
                            }
                        ]}
                    >
                        {percent}
                    </Text>
                </View>

            </View>

            <Text style={styles.title}>
                {title}
            </Text>

            <Text
                style={[
                    styles.amount,
                    {
                        color,
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
        borderRadius: 24,
        padding: 22,
        marginBottom: 18,
        borderWidth: 1,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,

        elevation: 2,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 22,
    },

    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },

    icon: {
        fontSize: 22,
        fontWeight: "bold",
    },

    percentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        alignSelf: "flex-start",
    },

    percentText: {
        fontSize: 12,
        fontWeight: "600",
    },

    title: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 10,
    },

    amount: {
        fontSize: 42,
        fontWeight: "bold",
    },
});