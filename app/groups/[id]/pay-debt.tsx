import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS }
    from "@/src/styles/colors";

import {
    getPaymentMethods,
} from "@/src/services/paymentService";

import {
    createPayment,
} from "@/src/services/paymentDebtService";

export default function PayDebtPage() {

    const {
        id,
        deudorId,
        acreedorId,
        monto,
    } = useLocalSearchParams();

    const [methods, setMethods] =
        useState<any[]>([]);

    const [selectedMethod, setSelectedMethod] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {

        loadMethods();

    }, []);

    const loadMethods = async () => {

        try {

            const data =
                await getPaymentMethods();

            setMethods(data);

            if (data.length > 0) {

                setSelectedMethod(
                    data[0]
                );
            }

        } catch (error) {

            console.log(error);
        }
    };

    const handlePay = async () => {
        if (loading) {
            return;
        }
        if (!selectedMethod) {

            Alert.alert(
                "Error",
                "Selecciona una tarjeta"
            );

            return;
        }

        try {

            setLoading(true);

            await createPayment({


                grupoId: Number(id),

                deudorId:
                    Number(deudorId),

                acreedorId:
                    Number(acreedorId),

                monto:
                    Number(monto),

                metodoPagoId:
                selectedMethod.id,
            });

            Alert.alert(
                "Pago realizado",
                "La deuda fue pagada"
            );

            router.back();

        } catch (error: any) {

            console.log(
                error.response?.data
            );

            Alert.alert(
                "Error",
                "No se pudo realizar el pago"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Confirmar pago
            </Text>

            <View style={styles.amountCard}>

                <Text style={styles.amountLabel}>
                    Total a pagar
                </Text>

                <Text style={styles.amount}>
                    S/ {monto}
                </Text>

            </View>

            <Text style={styles.sectionTitle}>
                Método de pago
            </Text>

            <FlatList
                data={methods}
                keyExtractor={(item) =>
                    item.id.toString()
                }
                renderItem={({ item }) => (

                    <TouchableOpacity
                        style={[
                            styles.methodCard,

                            selectedMethod?.id === item.id
                                ? styles.selectedCard
                                : null,
                        ]}
                        onPress={() =>
                            setSelectedMethod(item)
                        }
                    >

                        <Text style={styles.methodBrand}>
                            {item.cardBrand}
                        </Text>

                        <Text style={styles.methodLast4}>
                            **** {item.cardLast4}
                        </Text>

                    </TouchableOpacity>

                )}
            />

            <TouchableOpacity
                style={[

                    styles.payButton,

                    loading
                        ? styles.payButtonDisabled
                        : null,
                ]}
                onPress={handlePay}
                disabled={loading}
            >

                <Text style={styles.payButtonText}>

                    {
                        loading
                            ? "Procesando..."
                            : "Pagar ahora"
                    }

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
        fontSize: 30,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 30,
    },

    amountCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 28,
        padding: 30,
        marginBottom: 30,
    },

    amountLabel: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 15,
    },

    amount: {
        color: "white",
        fontSize: 42,
        fontWeight: "bold",
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 18,
        color: COLORS.text,
    },

    methodCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,

        borderWidth: 2,
        borderColor: "transparent",
    },

    selectedCard: {
        borderColor: COLORS.primary,
    },

    methodBrand: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.text,
    },

    methodLast4: {
        marginTop: 6,
        color: COLORS.subtitle,
    },

    payButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 20,
    },

    payButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },

    payButtonDisabled: {

        opacity: 0.6,
    },
});