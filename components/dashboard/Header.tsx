import { TouchableOpacity } from "react-native";

import { router } from "expo-router";

import { removeToken } from "@/src/utils/authStorage";

import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

type Props = {

    name: string;
};

export default function Header({
                                   name
                               }: Props) {
    const handleLogout = async () => {

        await removeToken();

        router.replace("/");
    };
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

                <Text style={styles.title}>
                    Hola, {firstName} 👋
                </Text>

                <Text style={styles.subtitle}>
                    Tus finanzas al día
                </Text>

            </View>

            <TouchableOpacity
                style={styles.avatar}
                onPress={handleLogout}
            >

                <Text style={styles.avatarText}>
                    {initials}
                </Text>

            </TouchableOpacity>

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
        width: 52,
        height: 52,
        borderRadius: 26,
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