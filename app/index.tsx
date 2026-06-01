import {
    useEffect,
    useState,
    useRef,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
} from "react-native";

import { getProfile } from "@/src/services/userService";
import { router } from "expo-router";
import { getToken, removeToken } from "@/src/utils/authStorage";
import { COLORS } from "@/src/styles/colors";
import { savePushToken } from "@/src/services/notificationService";
import { registerForPushNotifications } from "@/src/utils/pushNotifications";

export default function Home() {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    /* Animaciones */
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(16)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const loaderOpacity = useRef(new Animated.Value(0)).current;
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        /* Secuencia de entrada */
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(titleY, { toValue: 0, duration: 350, useNativeDriver: true }),
            ]),
            Animated.timing(subtitleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(loaderOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();

        /* Animación de puntos (loader) */
        const pulseDot = (dot: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 380, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 380, useNativeDriver: true }),
                ])
            ).start();

        pulseDot(dot1, 0);
        pulseDot(dot2, 180);
        pulseDot(dot3, 360);

        checkAuth();
    }, [dot1, dot2, dot3, loaderOpacity, logoOpacity, logoScale, subtitleOpacity, titleOpacity, titleY]);

    useEffect(() => {
        if (!loading && !authenticated) {
            router.replace("/login");
        }
    }, [loading, authenticated]);

    const checkAuth = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            try {
                await getProfile();
                registerForPushNotifications()
                    .then((pushToken) => {
                        if (pushToken) {
                            savePushToken(pushToken).catch(console.log);
                        }
                    })
                    .catch(console.log);
                setAuthenticated(true);
                router.replace("/(tabs)" as any);
            } catch {
                await removeToken();
            }

        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Círculos decorativos */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
            <View style={styles.circle4} />

            <View style={styles.content}>

                {/* Logo */}
                <Animated.View style={[
                    styles.logoWrapper,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }
                ]}>
                    <View style={styles.logoRing}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>Y</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Nombre app */}
                <Animated.View style={{
                    opacity: titleOpacity,
                    transform: [{ translateY: titleY }],
                    alignItems: "center",
                }}>
                    <Text style={styles.appName}>Yara</Text>
                </Animated.View>

                {/* Tagline */}
                <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
                    Gestiona tus gastos compartidos
                </Animated.Text>

                {/* Loader de puntos */}
                <Animated.View style={[styles.dotsRow, { opacity: loaderOpacity }]}>
                    {[dot1, dot2, dot3].map((dot, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.dot, { opacity: dot }]}
                        />
                    ))}
                </Animated.View>

            </View>

            {/* Footer */}
            <Animated.Text style={[styles.footer, { opacity: subtitleOpacity }]}>
                v1.0.0
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    /* Círculos decorativos */
    circle1: {
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: -120,
        right: -100,
    },

    circle2: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(255,255,255,0.04)",
        bottom: -60,
        left: -70,
    },

    circle3: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(255,255,255,0.05)",
        top: 100,
        left: -30,
    },

    circle4: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.06)",
        bottom: 160,
        right: 30,
    },

    content: {
        alignItems: "center",
    },

    /* Logo */
    logoWrapper: {
        marginBottom: 28,
    },

    logoRing: {
        width: 120,
        height: 120,
        borderRadius: 38,
        backgroundColor: "rgba(255,255,255,0.12)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.2)",
    },

    logo: {
        width: 88,
        height: 88,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 42,
        fontWeight: "800",
        letterSpacing: -1,
    },

    appName: {
        fontSize: 44,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -1.5,
        marginBottom: 10,
    },

    tagline: {
        fontSize: 15,
        color: "rgba(255,255,255,0.65)",
        fontWeight: "500",
        letterSpacing: 0.3,
        marginBottom: 52,
    },

    /* Loader puntos */
    dotsRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.85)",
    },

    /* Footer */
    footer: {
        position: "absolute",
        bottom: 48,
        fontSize: 12,
        color: "rgba(255,255,255,0.35)",
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});
