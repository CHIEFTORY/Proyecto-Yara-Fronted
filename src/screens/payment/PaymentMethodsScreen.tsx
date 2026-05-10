import { router }
    from "expo-router";

import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    FlatList,
} from "react-native";

import {
    useFocusEffect,
} from "@react-navigation/native";

import React,
{
    useState,
} from "react";

import { COLORS }
    from "@/src/styles/colors";

import {
    getPaymentMethods,
    deletePaymentMethod,
} from "@/src/services/paymentService";

export default function PaymentMethodsScreen() {

    const [methods, setMethods] =
        useState<any[]>([]);

    useFocusEffect(

        React.useCallback(() => {

            loadMethods();

        }, [])

    );

    const loadMethods =
        async () => {

            try {

                const data =
                    await getPaymentMethods();

                setMethods(data);

            } catch (error) {

                console.log(error);
            }
        };

    const handleDelete =
        async (id: number) => {

            Alert.alert(
                "Eliminar tarjeta",
                "¿Deseas eliminar esta tarjeta?",
                [

                    {
                        text: "Cancelar",
                        style: "cancel",
                    },

                    {
                        text: "Eliminar",

                        style: "destructive",

                        onPress: async () => {

                            try {

                                await deletePaymentMethod(id);

                                loadMethods();

                            } catch (error) {

                                console.log(error);

                                Alert.alert(
                                    "Error",
                                    "No se pudo eliminar"
                                );
                            }
                        }
                    }
                ]
            );
        };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Métodos de pago
            </Text>

            <FlatList
                data={methods}
                keyExtractor={(item) =>
                    item.id.toString()
                }
                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <View>

                            <Text style={styles.brand}>
                                {item.cardBrand}
                            </Text>

                            <Text style={styles.last4}>
                                **** {item.cardLast4}
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    handleDelete(item.id)
                                }
                            >

                                <Text style={styles.deleteText}>
                                    Eliminar
                                </Text>

                            </TouchableOpacity>

                        </View>

                        {
                            item.predeterminado && (

                                <View style={styles.badge}>

                                    <Text style={styles.badgeText}>
                                        Principal
                                    </Text>

                                </View>

                            )
                        }

                    </View>

                )}
                ListEmptyComponent={

                    <Text style={styles.empty}>
                        No tienes tarjetas agregadas
                    </Text>
                }
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    router.push(
                        "/culqi-checkout" as any
                    )
                }
            >

                <Text style={styles.buttonText}>
                    Agregar tarjeta
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
        borderRadius: 22,
        padding: 20,
        marginBottom: 14,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    brand: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.text,
    },

    last4: {
        marginTop: 6,
        color: COLORS.subtitle,
    },

    badge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },

    badgeText: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 12,
    },

    empty: {
        textAlign: "center",
        marginTop: 80,
        color: COLORS.subtitle,
    },

    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 20,
    },

    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    deleteText: {

        color: "red",
        fontWeight: "700",
        marginTop: 10,
    },
});