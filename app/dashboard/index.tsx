import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickAction from "@/components/dashboard/QuickAction";
import GroupCard from "@/components/dashboard/GroupCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import ExpenseChart from "@/components/dashboard/ExpenseChart";

import { getReadableType } from "@/src/utils/notifications";
import {
    getNotifications,
    NotificationItem,
} from "@/src/services/notificationService";
import { formatTimeAgo } from "@/src/utils/time";
import { useRelativeTimeTick } from "@/src/hooks/useRelativeTimeTick";
import { getMyGroups, getDashboardBalance } from "@/src/services/groupService";
import { getToken } from "@/src/utils/authStorage";
import { getMeRequest } from "@/src/services/authService";
import { COLORS } from "@/src/styles/colors";
import { useAppRefresh } from "@/src/utils/appEvents";
import { useTheme } from "@/src/context/ThemeContext";

import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    Animated,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BRAND_DARK = "#082E74";
const BRAND_BLUE = "#2563EB";
const SURFACE = "#EEF4FF";

export default function DashboardScreen() {

    const { colors, isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [groups, setGroups] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const now = useRelativeTimeTick();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 520,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 520,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const loadDashboard = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const userData = await getMeRequest();
            setUser(userData);

            const groupsData = await getMyGroups();
            setGroups(groupsData);

            const balanceData = await getDashboardBalance();
            setBalance(balanceData);

            const notificationsData = await getNotifications();
            setNotifications(notificationsData.slice(0, 3));
        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
        } finally {
            animateIn();
        }
    }, [animateIn]);

    useFocusEffect(
        React.useCallback(() => {
            loadDashboard();
        }, [loadDashboard])
    );

    useAppRefresh(["dashboard", "activity", "badge", "groups", "payments"], loadDashboard);

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Buenos dias" :
            hour < 19 ? "Buenas tardes" :
                "Buenas noches";
    const debtGroups = groups.filter((group) => Number(group.miBalance || 0) < 0).length;
    const positiveGroups = groups.filter((group) => Number(group.miBalance || 0) > 0).length;
    const hasUnreadNotifications = notifications.some((item) => !item.leido);

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={isDark ? "#07111F" : BRAND_DARK} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={[
                    styles.hero,
                    { backgroundColor: isDark ? "#07111F" : BRAND_DARK },
                ]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />

                    <Animated.View
                        style={[
                            styles.heroContent,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.topBar}>
                            <View style={styles.brandPill}>
                                <Image
                                    source={require("@/assets/images/yara-adaptive-foreground-final.png")}
                                    style={styles.brandMark}
                                    resizeMode="contain"
                                />
                                <Text style={styles.brandText}>Yara</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.notifButton}
                                onPress={() => router.push("/activity" as any)}
                                activeOpacity={0.75}
                            >
                                <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
                                {hasUnreadNotifications && <View style={styles.notifDot} />}
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.greetingLabel}>{greeting}</Text>
                        <Text style={styles.greetingName} numberOfLines={1} adjustsFontSizeToFit>
                            {user?.nombre || "Usuario"}
                        </Text>
                        <Text style={styles.greetingSubtitle}>
                            Controla tus grupos, pagos y deudas desde un solo lugar.
                        </Text>

                        <View style={styles.heroStats}>
                            <HeroStat label="Grupos" value={String(groups.length)} icon="people-outline" />
                            <HeroStat label="Con deuda" value={String(debtGroups)} icon="arrow-up-circle-outline" />
                            <HeroStat label="A favor" value={String(positiveGroups)} icon="arrow-down-circle-outline" />
                        </View>
                    </Animated.View>
                </View>

                <Animated.View
                    style={[
                        styles.balanceWrap,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <BalanceCard
                        balanceGeneral={balance?.balanceGeneral || 0}
                        totalDebes={balance?.totalDebes || 0}
                        totalTeDeben={balance?.totalTeDeben || 0}
                    />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <ExpenseChart />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionEyebrow, { color: isDark ? "#64748B" : "#64748B" }]}>Operaciones</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones rapidas</Text>
                        </View>
                    </View>

                    <View style={styles.quickActionsGrid}>
                        <QuickAction
                            title="Pagar deudas"
                            icon="card-outline"
                            color="#047857"
                            onPress={() => router.push("/payment?returnTo=dashboard" as any)}
                        />
                        <QuickAction
                            title="Validar pagos"
                            icon="shield-checkmark-outline"
                            color="#B45309"
                            onPress={() => router.push("/payment/confirmations?returnTo=dashboard" as any)}
                        />
                        <QuickAction
                            title="Metodos"
                            icon="wallet-outline"
                            color="#7C3AED"
                            onPress={() => router.push("/profile/yape?returnTo=dashboard" as any)}
                        />
                        <QuickAction
                            title="Crear grupo"
                            icon="people-outline"
                            color="#1D4ED8"
                            onPress={() => router.push("/(tabs)/groups/create?returnTo=dashboard" as any)}
                        />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionEyebrow, { color: isDark ? "#64748B" : "#64748B" }]}>Resumen</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis grupos</Text>
                        </View>
                        {groups.length > 0 && (
                            <TouchableOpacity onPress={() => router.push("/groups" as any)}>
                                <View style={styles.viewAllRow}>
                                    <Text style={styles.viewAll}>Ver todos</Text>
                                    <Ionicons name="chevron-forward" size={14} color={BRAND_BLUE} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {groups.length === 0 ? (
                        <View style={[
                            styles.emptyCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: isDark ? "#1E293B" : "transparent",
                            },
                        ]}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="people-outline" size={28} color={BRAND_BLUE} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin grupos aun</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
                                Crea tu primer grupo para empezar a dividir gastos.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyAction}
                                onPress={() => router.push("/(tabs)/groups/create" as any)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={17} color="#FFFFFF" />
                                <Text style={styles.emptyActionText}>Crear grupo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        groups.slice(0, 4).map((group) => (
                            <GroupCard
                                key={group.id}
                                name={group.nombre}
                                lastActivity={`${group.cantidadMiembros} miembros`}
                                miBalance={group.miBalance}
                                color={group.color || BRAND_BLUE}
                                onPress={() => router.push(`/(tabs)/groups/${group.id}?returnTo=dashboard` as any)}
                            />
                        ))
                    )}
                </Animated.View>

                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionEyebrow, { color: isDark ? "#64748B" : "#64748B" }]}>Ultimos movimientos</Text>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actividad</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/activity" as any)}>
                            <View style={styles.viewAllRow}>
                                <Text style={styles.viewAll}>Ver todo</Text>
                                <Ionicons name="chevron-forward" size={14} color={BRAND_BLUE} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.activityCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: isDark ? "#1E293B" : "transparent",
                        },
                    ]}>
                        {notifications.length === 0 ? (
                            <View style={styles.emptyActivity}>
                                <View style={styles.emptyActivityIcon}>
                                    <Ionicons name="notifications-outline" size={26} color={BRAND_BLUE} />
                                </View>
                                <Text style={[styles.emptyActivityTitle, { color: colors.text }]}>
                                    Sin actividad reciente
                                </Text>
                                <Text style={[styles.emptyActivitySubtitle, { color: colors.subtitle }]}>
                                    Aqui apareceran pagos, gastos y movimientos.
                                </Text>
                            </View>
                        ) : (
                            notifications.map((item) => (
                                <ActivityItem
                                    key={item.id}
                                    title={item.mensaje}
                                    subtitle={
                                        item.grupoNombre
                                            ? `${item.grupoNombre} - ${getReadableType(item.tipo)}`
                                            : getReadableType(item.tipo)
                                    }
                                    amount=""
                                    time={formatTimeAgo(item.fecha, now)}
                                    positive={item.tipo === "PAGO"}
                                    onPress={
                                        item.tipo?.trim().toUpperCase() === "INVITACION"
                                            ? () => router.push("/activity?tab=requests" as any)
                                            : item.grupoId
                                                ? () => router.push(`/groups/${item.grupoId}` as any)
                                                : undefined
                                    }
                                />
                            ))
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function HeroStat({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View style={styles.heroStat}>
            <View style={styles.heroStatIcon}>
                <Ionicons name={icon} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.heroStatValue}>{value}</Text>
            <Text style={styles.heroStatLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: SURFACE,
    },

    container: {
        flex: 1,
    },

    content: {
        paddingBottom: 120,
    },

    hero: {
        backgroundColor: BRAND_DARK,
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 82,
        borderBottomLeftRadius: 34,
        borderBottomRightRadius: 34,
        overflow: "hidden",
    },

    heroGlowTop: {
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(37,99,235,0.58)",
        top: -90,
        right: -80,
    },

    heroGlowBottom: {
        position: "absolute",
        width: 210,
        height: 210,
        borderRadius: 105,
        backgroundColor: "rgba(125,211,252,0.18)",
        bottom: -80,
        left: -70,
    },

    heroContent: {
        position: "relative",
        zIndex: 2,
    },

    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
    },

    brandPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 999,
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },

    brandMark: {
        width: 30,
        height: 30,
    },

    brandText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },

    greetingLabel: {
        fontSize: 14,
        color: "rgba(255,255,255,0.68)",
        fontWeight: "700",
        marginBottom: 6,
    },

    greetingName: {
        fontSize: 34,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0,
    },

    greetingSubtitle: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "600",
        marginTop: 8,
        maxWidth: 310,
    },

    notifButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },

    notifDot: {
        position: "absolute",
        top: 9,
        right: 9,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#EF4444",
        borderWidth: 2,
        borderColor: BRAND_DARK,
    },

    heroStats: {
        flexDirection: "row",
        gap: 10,
        marginTop: 22,
    },

    heroStat: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },

    heroStatIcon: {
        width: 30,
        height: 30,
        borderRadius: 11,
        backgroundColor: "rgba(255,255,255,0.14)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    heroStatValue: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "900",
    },

    heroStatLabel: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 11,
        fontWeight: "800",
        marginTop: 2,
    },

    balanceWrap: {
        paddingHorizontal: 20,
        marginTop: -58,
    },

    section: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

    sectionEyebrow: {
        color: "#64748B",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0,
        textTransform: "uppercase",
        marginBottom: 4,
    },

    sectionTitle: {
        fontSize: 21,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 0,
    },

    viewAll: {
        fontSize: 13,
        fontWeight: "800",
        color: BRAND_BLUE,
    },

    viewAllRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },

    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
    },

    activityCard: {
        backgroundColor: COLORS.white,
        borderRadius: 26,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 3,
    },

    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 26,
        padding: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 3,
    },

    emptyIconBox: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 6,
    },

    emptySubtitle: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        fontSize: 14,
        marginBottom: 20,
    },

    emptyAction: {
        backgroundColor: BRAND_BLUE,
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    emptyActionText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
    },

    emptyActivity: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },

    emptyActivityIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    emptyActivityTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 6,
    },

    emptyActivitySubtitle: {
        textAlign: "center",
        color: "#64748B",
        lineHeight: 22,
        fontSize: 14,
        paddingHorizontal: 20,
    },
});
