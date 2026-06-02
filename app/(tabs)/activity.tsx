import React, {
    useState,
} from "react";

import {
    getReadableType,
} from "@/src/utils/notifications";

import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useFocusEffect,
} from "@react-navigation/native";

import {
    COLORS,
} from "@/src/styles/colors";

import {
    formatTimeAgo,
} from "@/src/utils/time";
import { useRelativeTimeTick } from "@/src/hooks/useRelativeTimeTick";
import { useToast } from "@/src/context/ToastContext";

import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    getPendingInvitations,
    acceptInvitation,
    rejectInvitation,
    NotificationItem,
    InvitationItem,
} from "@/src/services/notificationService";

/* ── Config de tipos de notificación ── */
const NOTIFICATION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    PAGO:             { icon: "card-outline",             color: "#16A34A", bg: "#DCFCE7" },
    PAGO_PENDIENTE:   { icon: "time-outline",             color: "#D97706", bg: "#FEF3C7" },
    PAGO_CONFIRMADO:  { icon: "checkmark-circle-outline", color: "#16A34A", bg: "#DCFCE7" },
    GASTO:            { icon: "receipt-outline",          color: "#2563EB", bg: "#DBEAFE" },
    EDIT:             { icon: "create-outline",           color: "#7C3AED", bg: "#EDE9FE" },
    DELETE:           { icon: "trash-outline",            color: "#DC2626", bg: "#FEE2E2" },
    INVITACION:       { icon: "people-outline",           color: "#0891B2", bg: "#CFFAFE" },
    DEFAULT:          { icon: "notifications-outline",    color: COLORS.primary, bg: "#DBEAFE" },
};

const getConfig = (type: string) => {
    const normalized = type?.trim().toUpperCase();

    if (normalized === "PAGO_RECHAZADO") {
        return { icon: "alert-circle-outline", color: "#DC2626", bg: "#FEE2E2" };
    }

    if (normalized === "JOIN") {
        return { icon: "person-add-outline", color: "#0891B2", bg: "#CFFAFE" };
    }

    return NOTIFICATION_CONFIG[normalized] ?? NOTIFICATION_CONFIG.DEFAULT;
};

const getNotificationAction = (notification: NotificationItem) => {
    const normalized = notification.tipo?.trim().toUpperCase();

    if (normalized === "PAGO_PENDIENTE") {
        return {
            label: "Validar pago",
            icon: "checkmark-done-outline" as const,
            route: "/payment/confirmations?returnTo=activity",
        };
    }

    if (normalized === "PAGO_RECHAZADO") {
        return {
            label: "Pagar deuda",
            icon: "card-outline" as const,
            route: "/payment?returnTo=activity",
        };
    }

    if (normalized === "PAGO_CONFIRMADO" || normalized === "PAGO") {
        return {
            label: "Ver pagos",
            icon: "receipt-outline" as const,
            route: "/payment/history?returnTo=activity",
        };
    }

    if (normalized !== "INVITACION" && notification.grupoId) {
        return {
            label: "Ir al grupo",
            icon: "arrow-forward" as const,
            route: `/groups/${notification.grupoId}`,
        };
    }

    return null;
};

export default function ActivityPage() {

    const {
        tab,
    } = useLocalSearchParams();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [activeTab, setActiveTab] = useState<"ACTIVITY" | "REQUESTS">("ACTIVITY");
    const [activityView, setActivityView] = useState<"ALL" | "UNREAD">("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingIds, setMarkingIds] = useState<number[]>([]);
    const now = useRelativeTimeTick();
    const toast = useToast();

    const timelineNotifications = notifications.filter(
        (notification) => notification.tipo?.trim().toUpperCase() !== "INVITACION"
    );
    const unreadCount = timelineNotifications.filter((n) => !n.leido).length;
    const displayedNotifications = notifications
        .filter((notification) => notification.tipo?.trim().toUpperCase() !== "INVITACION")
        .filter((notification) => activityView === "ALL" || !notification.leido)
        .sort((a, b) => Number(a.leido) - Number(b.leido));

    useFocusEffect(
        React.useCallback(() => {
            if (tab === "requests") {
                setActiveTab("REQUESTS");
            }
            loadData();
        }, [tab])
    );

    const loadData = async () => {
        try {
            const [notificationsData, invitationsData] = await Promise.all([
                getNotifications(),
                getPendingInvitations(),
            ]);
            setNotifications(notificationsData);
            setInvitations(invitationsData);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handleMarkAsRead = async (item: NotificationItem) => {
        if (item.leido || markingIds.includes(item.id)) return;

        setMarkingIds((cur) => [...cur, item.id]);

        try {
            await markNotificationAsRead(item.id);
            setNotifications((cur) =>
                cur.map((n) => n.id === item.id ? { ...n, leido: true } : n)
            );
        } catch (error) {
            console.log(error);
            toast.showToast({
                type: "error",
                title: "No se pudo marcar",
                message: "Intenta nuevamente.",
            });
        } finally {
            setMarkingIds((cur) => cur.filter((id) => id !== item.id));
        }
    };

    const handleMarkAll = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsRead();
            setNotifications((cur) => cur.map((n) => ({ ...n, leido: true })));
        } catch (error) {
            console.log(error);
            toast.showToast({
                type: "error",
                title: "No se pudo completar",
                message: "No se pudieron marcar todas.",
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando actividad...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* ── HEADER ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Actividad</Text>
                    <Text style={styles.subtitle}>
                        {activeTab === "ACTIVITY"
                            ? unreadCount === 0
                                ? "Todo al día"
                                : `${unreadCount} sin leer`
                            : invitations.length === 0
                                ? "Sin solicitudes"
                                : `${invitations.length} pendiente${invitations.length !== 1 ? "s" : ""}`
                        }
                    </Text>
                </View>

                {activeTab === "ACTIVITY" && (
                    <TouchableOpacity
                        style={[
                            styles.markAllButton,
                            unreadCount === 0 && styles.markAllButtonDisabled,
                        ]}
                        onPress={handleMarkAll}
                        disabled={unreadCount === 0}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name="checkmark-done-outline"
                            size={20}
                            color={unreadCount === 0 ? "#CBD5E1" : COLORS.primary}
                        />
                        {unreadCount > 0 && (
                            <Text style={styles.markAllLabel}>Leer todo</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* ── TABS ── */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "ACTIVITY" && styles.tabActive]}
                    onPress={() => setActiveTab("ACTIVITY")}
                    activeOpacity={0.75}
                >
                    <Text style={[styles.tabText, activeTab === "ACTIVITY" && styles.tabTextActive]}>
                        Actividad
                    </Text>
                    {unreadCount > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "REQUESTS" && styles.tabActive]}
                    onPress={() => setActiveTab("REQUESTS")}
                    activeOpacity={0.75}
                >
                    <Text style={[styles.tabText, activeTab === "REQUESTS" && styles.tabTextActive]}>
                        Solicitudes
                    </Text>
                    {invitations.length > 0 && (
                        <View style={[styles.tabBadge, styles.tabBadgeOrange]}>
                            <Text style={styles.tabBadgeText}>{invitations.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── LISTA ── */}
            {activeTab === "ACTIVITY" && invitations.length > 0 && (
                <TouchableOpacity
                    style={styles.requestsNotice}
                    onPress={() => setActiveTab("REQUESTS")}
                    activeOpacity={0.84}
                >
                    <View style={styles.requestsNoticeIcon}>
                        <Ionicons name="mail-unread-outline" size={20} color="#B45309" />
                    </View>
                    <View style={styles.requestsNoticeTextWrap}>
                        <Text style={styles.requestsNoticeTitle}>
                            Tienes solicitudes pendientes
                        </Text>
                        <Text style={styles.requestsNoticeText}>
                            Revisa invitaciones antes de entrar a esos grupos.
                        </Text>
                    </View>
                    <View style={styles.requestsNoticeBadge}>
                        <Text style={styles.requestsNoticeBadgeText}>{invitations.length}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#B45309" />
                </TouchableOpacity>
            )}

            {activeTab === "ACTIVITY" && (
                <View style={styles.readFilters}>
                    <TouchableOpacity
                        style={[styles.readFilterChip, activityView === "ALL" && styles.readFilterChipActive]}
                        onPress={() => setActivityView("ALL")}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.readFilterText, activityView === "ALL" && styles.readFilterTextActive]}>
                            Todas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.readFilterChip, activityView === "UNREAD" && styles.readFilterChipActive]}
                        onPress={() => setActivityView("UNREAD")}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.readFilterText, activityView === "UNREAD" && styles.readFilterTextActive]}>
                            Sin leer
                        </Text>
                        {unreadCount > 0 && (
                            <View style={styles.readFilterBadge}>
                                <Text style={styles.readFilterBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={activeTab === "ACTIVITY" ? displayedNotifications : invitations}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={
                    (activeTab === "ACTIVITY" ? displayedNotifications : invitations).length === 0
                        ? styles.emptyList
                        : styles.list
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {

                    /* ── INVITACIÓN ── */
                    if (activeTab === "REQUESTS") {
                        const invitation = item as InvitationItem;
                        return (
                            <View style={styles.invitationCard}>
                                <View style={styles.invitationIconBox}>
                                    <Ionicons name="people-outline" size={22} color="#0891B2" />
                                </View>

                                <View style={styles.invitationContent}>
                                    <Text style={styles.invitationTitle}>
                                        Invitación a grupo
                                    </Text>
                                    <Text style={styles.invitationMsg}>
                                        <Text style={styles.bold}>{invitation.emisorNombre}</Text>
                                        {" te invitó a "}
                                        <Text style={styles.bold}>{invitation.grupoNombre}</Text>
                                    </Text>

                                    <View style={styles.invitationActions}>
                                        <TouchableOpacity
                                            style={styles.acceptButton}
                                            activeOpacity={0.8}
                                            onPress={async () => {
                                                try {
                                                    await acceptInvitation(invitation.id);
                                                    await loadData();
                                                } catch (error) {
                                                    console.log(error);
                                                    toast.showToast({
                                                        type: "error",
                                                        title: "No se pudo aceptar",
                                                        message: "Revisa tu conexion e intenta de nuevo.",
                                                    });
                                                }
                                            }}
                                        >
                            <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                            <Text style={styles.acceptText}>Aceptar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.rejectButton}
                                            activeOpacity={0.8}
                                            onPress={async () => {
                                                try {
                                                    await rejectInvitation(invitation.id);
                                                    await loadData();
                                                } catch (error) {
                                                    console.log(error);
                                                    toast.showToast({
                                                        type: "error",
                                                        title: "No se pudo rechazar",
                                                        message: "Revisa tu conexion e intenta de nuevo.",
                                                    });
                                                }
                                            }}
                                        >
                            <Ionicons name="close" size={15} color="#DC2626" />
                            <Text style={styles.rejectText}>Rechazar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }

                    const notification = item as NotificationItem;
                    const config = getConfig(notification.tipo);
                    const isUnread = !notification.leido;
                    const isMarking = markingIds.includes(notification.id);
                    const action = getNotificationAction(notification);

                    return (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                !isUnread && styles.cardRead,
                                isUnread && styles.cardUnread,
                                isMarking && styles.cardMarking,
                            ]}
                            onPress={() => handleMarkAsRead(notification)}
                            disabled={!isUnread || isMarking}
                            activeOpacity={0.9}
                        >
                            {isUnread && <View style={styles.unreadBar} />}

                            <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                                <Ionicons
                                    name={config.icon as any}
                                    size={20}
                                    color={config.color}
                                />
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.cardTopRow}>
                                    <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                                        <Text style={[styles.typeBadgeText, { color: config.color }]}>
                                            {getReadableType(notification.tipo)}
                                        </Text>
                                    </View>

                                    <View style={styles.cardTopRight}>
                                        {isUnread && <View style={styles.unreadDot} />}
                                        <Text style={styles.time}>
                                            {formatTimeAgo(notification.fecha, now)}
                                        </Text>
                                    </View>
                                </View>

                                {notification.grupoNombre && (
                                    <Text style={styles.groupTag}>{notification.grupoNombre}</Text>
                                )}

                                <Text style={styles.message}>
                                    {notification.mensaje || "Actividad registrada"}
                                </Text>
                                {isMarking && (
                                    <View style={styles.markingHint}>
                                        <Ionicons name="checkmark-outline" size={13} color={COLORS.primary} />
                                        <Text style={styles.markingHintText}>Marcando...</Text>
                                    </View>
                                )}
                                {action && (
                                    <TouchableOpacity
                                        style={styles.goToGroupButton}
                                        onPress={() => router.push(action.route as any)}
                                        activeOpacity={0.82}
                                    >
                                        <Text style={styles.goToGroupText}>{action.label}</Text>
                                        <Ionicons name={action.icon} size={13} color="#FFFFFF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons
                                name={activeTab === "ACTIVITY" ? "notifications-outline" : "people-outline"}
                                size={40}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {activeTab === "ACTIVITY"
                                ? activityView === "UNREAD"
                                    ? "Todo leido"
                                    : "Sin actividad"
                                : "Sin solicitudes"}
                        </Text>
                        <Text style={styles.emptyText}>
                            {activeTab === "ACTIVITY"
                                ? "Tus gastos, pagos y movimientos aparecerán aquí."
                                : "No tienes invitaciones pendientes por ahora."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F0F4FF",
        paddingHorizontal: 20,
        paddingTop: 64,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F4FF",
        gap: 14,
    },

    loadingText: {
        color: "#94A3B8",
        fontWeight: "600",
        fontSize: 15,
    },

    /* ── HEADER ── */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },

    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1E293B",
        letterSpacing: -0.5,
    },

    subtitle: {
        marginTop: 5,
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "600",
    },

    markAllButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
    },

    markAllButtonDisabled: {
        opacity: 0.45,
    },

    markAllLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.primary,
    },

    /* ── TABS ── */
    tabs: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        borderRadius: 18,
        padding: 5,
        marginBottom: 20,
        gap: 6,
    },

    tabButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 14,
        gap: 6,
    },

    tabActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },

    tabText: {
        fontWeight: "700",
        fontSize: 14,
        color: "#94A3B8",
    },

    tabTextActive: {
        color: "#1E293B",
    },

    tabBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },

    tabBadgeOrange: {
        backgroundColor: "#F59E0B",
    },

    tabBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "800",
    },

    /* ── LISTAS ── */
    requestsNotice: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#FDE68A",
        padding: 14,
        marginBottom: 14,
        gap: 10,
        shadowColor: "#F59E0B",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
    },

    requestsNoticeIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
    },

    requestsNoticeTextWrap: {
        flex: 1,
    },

    requestsNoticeTitle: {
        color: "#92400E",
        fontSize: 14,
        fontWeight: "900",
    },

    requestsNoticeText: {
        color: "#B45309",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
        lineHeight: 17,
    },

    requestsNoticeBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#F59E0B",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 7,
    },

    requestsNoticeBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
    },

    readFilters: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 14,
    },

    readFilterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        paddingVertical: 9,
    },

    readFilterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    readFilterText: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "800",
    },

    readFilterTextActive: {
        color: "#FFFFFF",
    },

    readFilterBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },

    readFilterBadgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "900",
    },

    list: {
        paddingBottom: 120,
    },

    emptyList: {
        flexGrow: 1,
    },

    /* ── CARD NOTIFICACIÓN ── */
    card: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
    },

    cardRead: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
    },

    cardUnread: {
        backgroundColor: "#F8FBFF",
        borderWidth: 1.5,
        borderColor: "#BFDBFE",
    },

    cardMarking: {
        borderColor: "#CBD5E1",
    },

    unreadBar: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
    },

    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        flexShrink: 0,
    },

    cardContent: {
        flex: 1,
    },

    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },

    cardTopRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    typeBadge: {
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 9,
    },

    typeBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    time: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
    },

    groupTag: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
        marginBottom: 5,
    },

    message: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600",
        color: "#1E293B",
    },

    markingHint: {
        alignSelf: "flex-start",
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#EEF2FF",
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 9,
    },

    markingHintText: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: "800",
    },

    goToGroupButton: {
        alignSelf: "flex-start",
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: COLORS.primary,
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },

    goToGroupText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
    },

    /* ── CARD INVITACIÓN ── */
    invitationCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 18,
        marginBottom: 12,
        alignItems: "flex-start",
        borderWidth: 1.5,
        borderColor: "#BAE6FD",
        shadowColor: "#0891B2",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
    },

    invitationIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#CFFAFE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        flexShrink: 0,
    },

    invitationContent: {
        flex: 1,
    },

    invitationTitle: {
        fontSize: 11,
        fontWeight: "800",
        color: "#0891B2",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 6,
    },

    invitationMsg: {
        fontSize: 14,
        color: "#1E293B",
        lineHeight: 20,
        marginBottom: 14,
    },

    bold: {
        fontWeight: "800",
    },

    invitationActions: {
        flexDirection: "row",
        gap: 10,
    },

    acceptButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 11,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },

    acceptText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 13,
    },

    rejectButton: {
        flex: 1,
        backgroundColor: "#FEF2F2",
        paddingVertical: 11,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    rejectText: {
        color: "#DC2626",
        fontWeight: "800",
        fontSize: 13,
    },

    /* ── EMPTY STATE ── */
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
        paddingBottom: 80,
        gap: 12,
    },

    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 28,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1E293B",
    },

    emptyText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#94A3B8",
        textAlign: "center",
        fontWeight: "500",
    },
});


