import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    Animated,
} from "react-native";
import {
    CommonActions,
    useNavigation,
    useFocusEffect,
} from "@react-navigation/native";
import {
    Ionicons,
} from "@expo/vector-icons";
import {
    useState,
    useRef,
    useCallback,
} from "react";

import {
    router,
} from "expo-router";

import {
    COLORS,
} from "@/src/styles/colors";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

import {
    getProfile,
    getCollectionMethods,
    MetodoCobro,
} from "@/src/services/userService";

import {
    removeToken,
} from "@/src/utils/authStorage";
import {
    removePushToken,
} from "@/src/services/notificationService";
import {
    registerForPushNotifications,
} from "@/src/utils/pushNotifications";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);
    const [collectionMethods, setCollectionMethods] = useState<MetodoCobro[]>([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const loadUser = useCallback(async () => {
        try {
            const [data, methods] = await Promise.all([
                getProfile(),
                getCollectionMethods(),
            ]);
            setUser(data);
            setCollectionMethods(Array.isArray(methods) ? methods : []);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
            ]).start();
        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
        }
    }, [fadeAnim, slideAnim]);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [loadUser])
    );

    const handleLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Seguro que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const pushToken = await registerForPushNotifications();
                            if (pushToken) {
                                await removePushToken(pushToken);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        await removeToken();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "login" as never }],
                            })
                        );
                    }
                }
            ]
        );
    };

    const initials = user?.nombre
        ?.split(" ")
        .map((word: string) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    const defaultMethod =
        collectionMethods.find((method) => method.predeterminado)
        || collectionMethods[0];
    const methodSummary = defaultMethod
        ? getCollectionMethodSummary(defaultMethod, collectionMethods.length)
        : "Yape, Plin o banco";

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <AmbientScreenBackground intensity="medium" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.deco1} />
                    <View style={styles.deco2} />
                    <View style={styles.deco3} />

                    <View style={styles.topRow}>
                        <View style={styles.topSpacer} />

                        <Text style={styles.headerLabel}>Mi perfil</Text>

                        {/* Botón editar rápido */}
                        <TouchableOpacity
                            style={styles.editQuickBtn}
                            onPress={() => router.push("/profile/edit")}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="create-outline" size={19} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.avatarOnlineDot} />
                    </View>

                    <Text style={styles.name}>{user?.nombre}</Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    {/* Pills de info */}
                    <View style={styles.pillsRow}>
                        <View style={styles.infoPill}>
                            <Text style={styles.infoPillText}>
                                {user?.telefono || "Sin teléfono"}
                            </Text>
                        </View>
                        {defaultMethod && (
                            <View style={[styles.infoPill, styles.yapePill]}>
                                <Text style={styles.infoPillText}>
                                    {methodLabel(defaultMethod.tipo)} activo
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── OPCIONES ── */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    {/* Grupo: Cuenta */}
                    <Text style={styles.groupLabel}>CUENTA</Text>

                    <View style={styles.optionsGroup}>
                        <OptionRow
                            icon="person-outline"
                            label="Editar perfil"
                            sublabel="Nombre y teléfono"
                            onPress={() => router.push("/profile/edit")}
                        />
                        <View style={styles.divider} />
                        <OptionRow
                            icon="lock-closed-outline"
                            label="Cambiar contraseña"
                            sublabel="Seguridad de tu cuenta"
                            onPress={() => router.push("/profile/password")}
                        />
                    </View>

                    {/* Grupo: Pagos */}
                    <Text style={styles.groupLabel}>PAGOS</Text>

                    <View style={styles.optionsGroup}>
                        <OptionRow
                            icon="wallet-outline"
                            label="Metodos de cobro"
                            sublabel={methodSummary}
                            onPress={() => router.push("/profile/yape")}
                            highlight={collectionMethods.length === 0}
                            highlightText="Pendiente"
                        />
                    </View>

                    {/* Grupo: App */}
                    <Text style={styles.groupLabel}>APP</Text>

                    <View style={styles.optionsGroup}>
                        <OptionRow
                            icon="notifications-outline"
                            label="Notificaciones"
                            sublabel="Actividad y recordatorios"
                            onPress={() => router.push("/activity" as any)}
                        />
                        <View style={styles.divider} />
                        <OptionRow
                            icon="help-circle-outline"
                            label="Ayuda y soporte"
                            sublabel="Preguntas frecuentes"
                            onPress={() => router.push("/profile/help")}
                        />
                    </View>

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>

                    {/* Versión */}
                    <Text style={styles.version}>Versión 1.0.0</Text>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

/* ── Subcomponente OptionRow ── */
function OptionRow({
                       icon,
                       label,
                       sublabel,
                       onPress,
                       highlight = false,
                       highlightText = "",
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    sublabel?: string;
    onPress: () => void;
    highlight?: boolean;
    highlightText?: string;
}) {
    return (
        <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.optionIconBox}>
                <Ionicons name={icon} size={19} color={COLORS.primary} />
            </View>
            <View style={styles.optionTexts}>
                <Text style={styles.optionLabel}>{label}</Text>
                {sublabel && <Text style={styles.optionSublabel}>{sublabel}</Text>}
            </View>
            <View style={styles.optionRight}>
                {highlight && (
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>{highlightText}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </View>
        </TouchableOpacity>
    );
}

function methodLabel(tipo?: string) {
    if (tipo === "PLIN") return "Plin";
    if (tipo === "BANCO") return "Banco";
    return "Yape";
}

function getCollectionMethodSummary(method: MetodoCobro, count: number) {
    const suffix = count > 1 ? ` +${count - 1}` : "";

    if (method.tipo === "BANCO") {
        return `${method.bancoNombre || "Banco"}${suffix}`;
    }

    return `${methodLabel(method.tipo)}: ${method.numeroTelefono || "configurado"}${suffix}`;
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    container: {
        flex: 1,
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: "center",
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
        overflow: "hidden",
        position: "relative",
    },

    deco1: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "rgba(255,255,255,0.06)",
        top: -80,
        right: -60,
    },

    deco2: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: -40,
        left: -30,
    },

    deco3: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.04)",
        top: 40,
        left: 60,
    },

    topRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        marginBottom: 28,
        zIndex: 2,
    },

    topSpacer: {
        width: 42,
        height: 42,
    },

    headerLabel: {
        fontSize: 17,
        fontWeight: "700",
        color: "rgba(255,255,255,0.9)",
        letterSpacing: 0.3,
    },

    editQuickBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },

    editQuickText: {
        fontSize: 18,
    },

    /* Avatar */
    avatarWrapper: {
        position: "relative",
        marginBottom: 16,
    },

    avatar: {
        width: 96,
        height: 96,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.22)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2.5,
        borderColor: "rgba(255,255,255,0.35)",
    },

    avatarText: {
        color: "white",
        fontSize: 36,
        fontWeight: "800",
    },

    avatarOnlineDot: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#4ADE80",
        borderWidth: 2.5,
        borderColor: COLORS.primary,
    },

    name: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 6,
    },

    email: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 16,
    },

    pillsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    infoPill: {
        backgroundColor: "rgba(255,255,255,0.16)",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },

    yapePill: {
        backgroundColor: "rgba(124,58,237,0.4)",
    },

    infoPillText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        fontWeight: "600",
    },

    /* ── SECCIÓN ── */
    section: {
        padding: 20,
        paddingTop: 26,
    },

    groupLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#94A3B8",
        letterSpacing: 1.5,
        marginBottom: 10,
        marginLeft: 4,
        marginTop: 22,
    },

    optionsGroup: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        gap: 14,
    },

    optionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },

    optionTexts: {
        flex: 1,
    },

    optionLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2,
    },

    optionSublabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "500",
    },

    optionRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    optionChevron: {
        fontSize: 22,
        color: "#CBD5E1",
        fontWeight: "300",
    },

    pendingBadge: {
        backgroundColor: "#FEF3C7",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },

    pendingText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#D97706",
    },

    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginLeft: 76,
    },

    /* ── LOGOUT ── */
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 22,
        padding: 18,
        marginTop: 32,
        gap: 10,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    logoutEmoji: {
        fontSize: 18,
    },

    logoutText: {
        color: "#DC2626",
        fontWeight: "800",
        fontSize: 16,
    },

    version: {
        textAlign: "center",
        color: "#CBD5E1",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 24,
    },
});
