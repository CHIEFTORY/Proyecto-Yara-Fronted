import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickAction from "@/components/dashboard/QuickAction";
import GroupCard from "@/components/dashboard/GroupCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import ExpenseChart from "@/components/dashboard/ExpenseChart";

import {
    getReadableType,
} from "@/src/utils/notifications";
import {
    getNotifications,
    NotificationItem,
} from "@/src/services/notificationService";

import {
    formatTimeAgo,
} from "@/src/utils/time";
import { useRelativeTimeTick } from "@/src/hooks/useRelativeTimeTick";

import {
    useFocusEffect,
} from "@react-navigation/native";
import { getMyGroups, getDashboardBalance } from "@/src/services/groupService";

import { router } from "expo-router";
import React, {
    useState,
    useRef,
    useCallback,
} from "react";

import { getToken } from "@/src/utils/authStorage";
import { getMeRequest } from "@/src/services/authService";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/src/styles/colors";
import { useAppRefresh } from "@/src/utils/appEvents";

export default function DashboardScreen() {

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

    const hora = new Date().getHours();
    const saludo =
        hora < 12 ? "Buenos días" :
            hora < 19 ? "Buenas tardes" :
                "Buenas noches";

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── GREETING HEADER ── */}
                <Animated.View
                    style={[
                        styles.greetingRow,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View>
                        <Text style={styles.greetingLabel}>{saludo}</Text>
                        <Text style={styles.greetingName}>
                            {user?.nombre || "Usuario"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.notifButton}
                        onPress={() => router.push("/activity" as any)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="notifications-outline" size={21} color={COLORS.primary} />
                        {notifications.length > 0 && (
                            <View style={styles.notifDot} />
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── BALANCE CARD ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <BalanceCard
                        balanceGeneral={balance?.balanceGeneral || 0}
                        totalDebes={balance?.totalDebes || 0}
                        totalTeDeben={balance?.totalTeDeben || 0}
                    />
                </Animated.View>

                {/* ── EXPENSE CHART ── */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ExpenseChart />
                </Animated.View>

                {/* ── ACCIONES ── */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.quickActionsGrid}
                    >
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
                    </ScrollView>
                </Animated.View>

                {/* ── MIS GRUPOS ── */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis grupos</Text>
                        {groups.length > 0 && (
                            <TouchableOpacity onPress={() => router.push("/groups" as any)}>
                                <View style={styles.viewAllRow}>
                                    <Text style={styles.viewAll}>Ver todos</Text>
                                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {groups.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="people-outline" size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Sin grupos aún</Text>
                            <Text style={styles.emptySubtitle}>
                                Crea tu primer grupo para empezar a dividir gastos
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
                        groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                name={group.nombre}
                                lastActivity={`${group.cantidadMiembros} miembros`}
                                miBalance={group.miBalance}
                                color={group.color || "#3B82F6"}
                                onPress={() => router.push(`/(tabs)/groups/${group.id}?returnTo=dashboard` as any)}
                            />
                        ))
                    )}
                </Animated.View>

                {/* ── ACTIVIDAD ── */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Actividad</Text>
                        <TouchableOpacity onPress={() => router.push("/activity" as any)}>
                            <View style={styles.viewAllRow}>
                                <Text style={styles.viewAll}>Ver todo</Text>
                                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityCard}>
                        {notifications.length === 0 ? (
                            <View style={styles.emptyActivity}>
                                <View style={styles.emptyActivityIcon}>
                                    <Ionicons name="notifications-outline" size={26} color={COLORS.primary} />
                                </View>
                                <Text style={styles.emptyActivityTitle}>
                                    Sin actividad reciente
                                </Text>
                                <Text style={styles.emptyActivitySubtitle}>
                                    Aquí aparecerán pagos, gastos y movimientos.
                                </Text>
                            </View>
                        ) : (
                            notifications.map((item) => (
                                <ActivityItem
                                    key={item.id}
                                    title={item.mensaje}
                                    subtitle={
                                        item.grupoNombre
                                            ? `${item.grupoNombre} • ${getReadableType(item.tipo)}`
                                            : getReadableType(item.tipo)
                                    }
                                    amount=""
                                    time={formatTimeAgo(item.fecha, now)}
                                    positive={item.tipo === "PAGO"}
                                    onPress={
                                        item.tipo?.trim().toUpperCase() === "INVITACION"
                                            ? () => router.push("/activity" as any)
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

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },

    /* ── GREETING ── */
    greetingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },

    greetingLabel: {
        fontSize: 14,
        color: COLORS.subtitle,
        fontWeight: "500",
        marginBottom: 4,
    },

    greetingName: {
        fontSize: 28,
        fontWeight: "800",
        color: COLORS.text,
        letterSpacing: -0.5,
    },

    notifButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
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
        borderColor: COLORS.white,
    },

    /* ── SECTIONS ── */
    section: {
        marginBottom: 32,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: COLORS.text,
        letterSpacing: -0.3,
    },

    viewAll: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.primary,
    },

    viewAllRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },

    /* ── QUICK ACTIONS ── */
    quickActionsGrid: {
        flexDirection: "row",
        gap: 14,
        paddingRight: 20,
    },

    /* ── ACTIVITY CARD ── */
    activityCard: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        paddingHorizontal: 22,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 14,
        elevation: 3,
    },

    /* ── EMPTY GRUPOS ── */
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 28,
        padding: 32,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
    },

    emptyIconBox: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 6,
    },

    emptySubtitle: {
        color: COLORS.subtitle,
        textAlign: "center",
        lineHeight: 22,
        fontSize: 14,
        marginBottom: 20,
    },

    emptyAction: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    emptyActionText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },

    /* ── EMPTY ACTIVITY ── */
    emptyActivity: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },

    emptyActivityIcon: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    emptyActivityTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 6,
    },

    emptyActivitySubtitle: {
        textAlign: "center",
        color: COLORS.subtitle,
        lineHeight: 22,
        fontSize: 14,
        paddingHorizontal: 20,
    },
});
