import {
    View,
    ActivityIndicator,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Text,
} from "react-native";

import {
    useRef,
    useState,
} from "react";

import { WebView }
    from "react-native-webview";

import {
    router,
} from "expo-router";

import {
    savePaymentMethod,
} from "@/src/services/paymentService";

export default function CulqiCheckoutScreen() {

    const publicKey =
        "pk_test_IZbCkT0E1C4UbzL7";

    const processingRef =
        useRef(false);

    const [loading, setLoading] =
        useState(false);

    const html = `
    <!DOCTYPE html>
    <html>

    <head>

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />

        <script src="https://checkout.culqi.com/js/v4"></script>

    </head>

    <body>

        <script>

            Culqi.publicKey =
                '${publicKey}';

            Culqi.settings({

                title: 'Yara',

                currency: 'PEN',

                amount: 10,
            });

            Culqi.options({

                lang: 'auto',

                installments: false,

                paymentMethods: {

                    tarjeta: true,

                    yape: false,

                    bancaMovil: false,

                    billetera: false,
                }
            });

            Culqi.open();

            function culqi() {

                if (Culqi.token) {

                    window.ReactNativeWebView.postMessage(

                        JSON.stringify({

                            type: "success",

                            token:
                                Culqi.token.id,

                            email:
                                Culqi.token.email,

                            cardBrand:
                                Culqi.token.iin.card_brand,

                            last4:
                                Culqi.token.card_number.slice(-4),
                        })
                    );

                } else {

                    window.ReactNativeWebView.postMessage(

                        JSON.stringify({

                            type: "close"
                        })
                    );
                }
            }

        </script>

    </body>

    </html>
    `;

    const handleMessage =
        async (event: any) => {

            const data =
                JSON.parse(
                    event.nativeEvent.data
                );

            if (data.type === "close") {

                router.back();

                return;
            }

            if (processingRef.current) {
                return;
            }

            processingRef.current = true;

            setLoading(true);

            try {

                console.log(
                    "TOKEN RECIBIDO:"
                );

                console.log(data);

                await savePaymentMethod({

                    culqiToken:
                    data.token,
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
                    "No se pudo agregar"
                );

            } finally {

                setLoading(false);

                processingRef.current =
                    false;
            }
        };

    const handleNavigationChange =
        (navState: any) => {

            const url =
                navState.url;

            console.log(
                "WEBVIEW URL:",
                url
            );

            if (
                url.includes(
                    "checkout.culqi.com/close"
                )
            ) {

                router.back();
            }
        };

    return (

        <View style={styles.container}>

            {
                loading && (

                    <View style={styles.loadingOverlay}>

                        <ActivityIndicator
                            size="large"
                            color="#000"
                        />

                    </View>
                )
            }

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
            >

                <Text style={styles.closeText}>
                    Cerrar
                </Text>

            </TouchableOpacity>

            <WebView
                originWhitelist={["*"]}
                source={{ html }}
                onMessage={handleMessage}
                onNavigationStateChange={
                    handleNavigationChange
                }
                startInLoadingState
                renderLoading={() => (

                    <ActivityIndicator
                        size="large"
                    />

                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    loadingOverlay: {

        position: "absolute",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor:
            "rgba(255,255,255,0.7)",

        zIndex: 999,
    },

    closeButton: {

        position: "absolute",

        top: 50,
        right: 20,

        zIndex: 9999,

        backgroundColor: "#000",

        paddingHorizontal: 16,
        paddingVertical: 10,

        borderRadius: 10,
    },

    closeText: {

        color: "#fff",
        fontWeight: "bold",
    },
});