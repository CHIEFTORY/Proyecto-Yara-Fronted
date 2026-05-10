import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";

import {
    useState,
} from "react";

import {
    router,
} from "expo-router";

import { COLORS }
    from "@/src/styles/colors";

import {
    savePaymentMethod,
} from "@/src/services/paymentService";

export default function AddPaymentMethodScreen() {

    const [cardNumber, setCardNumber] =
        useState("");

    const [cardBrand, setCardBrand] =
        useState("VISA");

    const [loading, setLoading] =
        useState(false);

    const handleSave = async () => {

        try {

            setLoading(true);

            const last4 =
                cardNumber.slice(-4);

            await savePaymentMethod({

                proveedor: "CULQI",

                cardBrand,

                cardLast4: last4,

                culqiCustomerId:
                    "cus_test_demo",

                culqiCardId:
                    "card_test_demo",

                predeterminado: true,
            });

            Alert.alert(
                "Éxito",
                "Tarjeta agregada"
            );

            router.back();

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Error",
                "No se pudo guardar"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Agregar tarjeta
            </Text>

            <View style={styles.card}>

                <Text style={styles.label}>
                    Número de tarjeta
                </Text>

                <TextInput
                    placeholder="4111 1111 1111 1111"
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    style={styles.input}
                />

                <Text style={styles.label}>
                    Marca
                </Text>

                <View style={styles.row}>

                    <TouchableOpacity
                        style={[
                            styles.brandButton,

                            cardBrand === "VISA"
                                ? styles.active
                                : null,
                        ]}
                        onPress={() =>
                            setCardBrand("VISA")
                        }
                    >

                        <Text
                            style={[
                                styles.brandText,

                                cardBrand === "VISA"
                                    ? styles.activeText
                                    : null,
                            ]}
                        >
                            VISA
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.brandButton,

                            cardBrand === "MASTERCARD"
                                ? styles.active
                                : null,
                        ]}
                        onPress={() =>
                            setCardBrand(
                                "MASTERCARD"
                            )
                        }
                    >

                        <Text
                            style={[
                                styles.brandText,

                                cardBrand === "MASTERCARD"
                                    ? styles.activeText
                                    : null,
                            ]}
                        >
                            Mastercard
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={loading}
            >

                <Text style={styles.buttonText}>
                    Guardar tarjeta
                </Text>

            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
        paddingTop: 70,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 24,
    },

    card: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    label: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 12,
    },

    input: {
        backgroundColor: "#F1F5F9",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 20,
        fontSize: 16,
    },

    row: {
        flexDirection: "row",
    },

    brandButton: {
        flex: 1,
        backgroundColor: "#E2E8F0",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginRight: 10,
    },

    active: {
        backgroundColor: COLORS.primary,
    },

    brandText: {
        color: COLORS.text,
        fontWeight: "700",
    },

    activeText: {
        color: "white",
    },

    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 30,
    },

    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
});