import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {
    title: string;
    icon: string;
    color: string;
    background: string;
    onPress?: () => void;
};

export default function QuickAction({

                                        title,
                                        icon,
                                        color,
                                        background,
                                        onPress,

                                    }: Props) {

    return (

        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >

            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: background,
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
                    {icon}
                </Text>

            </View>

            <Text style={styles.title}>
                {title}
            </Text>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 18,
        flex: 1,
        minWidth: "30%",
        maxWidth: "31%",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },

    icon: {
        fontSize: 24,
        fontWeight: "bold",
    },

    title: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.text,
        textAlign: "center",
    },
});