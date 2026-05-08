import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

export default function FloatingButton() {

    return (

        <TouchableOpacity style={styles.button}>

            <Text style={styles.plus}>
                +
            </Text>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    button: {
        position: "absolute",

        bottom: 30,
        right: 24,

        width: 60,
        height: 60,
        borderRadius: 30,

        backgroundColor: "rgba(37, 99, 235, 0.88)",

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#2563EB",
        shadowOpacity: 0.18,
        shadowRadius: 8,

        elevation: 8,
    },

    plus: {
        color: COLORS.white,
        fontSize: 36,
        fontWeight: "300",
        marginTop: -2,
    },
});