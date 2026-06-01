import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Animated,
    Platform,
} from "react-native";

import React, {
    useState,
    useRef,
    useCallback,
} from "react";

import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "@/src/styles/colors";
import { getMyGroups } from "@/src/services/groupService";
import { Ionicons } from "@expo/vector-icons";

// ─── Paleta navy premium ───────────────────────────────────────────────────────
const NAVY   = "#0F1F5C";
const ACCENT = "#6382FF";      // azul-índigo más suave
const SURFACE = "#F6F7FB";    // fondo general frío-neutro
const WHITE  = "#FFFFFF";

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GroupsScreen() {

    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(18)).current;

    const loadGroups = useCallback(async () => {
        try {
            const data = await getMyGroups();
            setGroups(data);
        } catch (error: any) {
            if (error.response?.status === 401) return;
            console.log(error);
        } finally {
            setLoading(false);
            Animated.parallel([
                Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }, [fadeAnim, slideAnim]);

    useFocusEffect(
        React.useCallback(() => {
            fadeAnim.setValue(0);
            slideAnim.setValue(18);
            loadGroups();
        }, [fadeAnim, loadGroups, slideAnim])
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.loaderText}>Cargando grupos…</Text>
            </View>
        );
    }

    const debtCount = groups.filter(g => (g.miBalance || 0) < 0).length;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER ── */}
                <Animated.View
                    style={[
                        styles.headerSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Mis grupos</Text>
                        <Text style={styles.subtitle}>
                            {groups.length === 0
                                ? "Crea el primero y empieza a dividir"
                                : debtCount > 0
                                    ? `${groups.length} grupo${groups.length !== 1 ? "s" : ""} · ${debtCount} deuda${debtCount !== 1 ? "s" : ""} pendiente${debtCount !== 1 ? "s" : ""}`
                                    : `${groups.length} grupo${groups.length !== 1 ? "s" : ""} · Todo al día ✓`
                            }
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={() => router.push("/groups/create" as any)}
                        activeOpacity={0.82}
                    >
                        <Ionicons name="add" size={18} color={WHITE} />
                        <Text style={styles.createBtnText}>Nuevo</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── STATS ── */}
                {groups.length > 0 && (
                    <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                        <StatCard
                            value={debtCount > 0
                                ? `${debtCount} deuda${debtCount !== 1 ? "s" : ""}`
                                : "Al día"}
                            label="Balance general"
                            iconName={debtCount > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
                            iconColor={debtCount > 0 ? "#DC2626" : "#16A34A"}
                            iconBg={debtCount > 0 ? "#FEF2F2" : "#DCFCE7"}
                            valueColor={debtCount > 0 ? "#DC2626" : "#16A34A"}
                        />
                        <StatCard
                            value={`${groups.filter(g => (g.miBalance || 0) > 0).length}`}
                            label="Te deben"
                            iconName="arrow-down-circle-outline"
                            iconColor={ACCENT}
                            iconBg="#EEF1FF"
                        />
                    </Animated.View>
                )}

                {/* ── LISTA ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {groups.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <Text style={styles.listLabel}>Recientes</Text>
                            {groups.map((group: any, index: number) => {
                                const groupColor = group.color || NAVY;
                                const balance    = group.miBalance || 0;
                                const positivo   = balance > 0;
                                const neutro     = balance === 0;

                                return (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        groupColor={groupColor}
                                        balance={balance}
                                        positivo={positivo}
                                        neutro={neutro}
                                        delay={index * 40}
                                    />
                                );
                            })}
                        </>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
                      value, label, iconName, iconColor, iconBg, valueColor,
                  }: {
    value: string;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    valueColor?: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName} size={17} color={iconColor} />
            </View>
            <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function GroupCard({
                       group, groupColor, balance, positivo, neutro,
                   }: {
    group: any;
    groupColor: string;
    balance: number;
    positivo: boolean;
    neutro: boolean;
    delay: number;
}) {
    const balanceBg    = neutro ? "#F1F5F9"  : positivo ? "#DCFCE7" : "#FEE2E2";
    const balanceColor = neutro ? "#94A3B8"  : positivo ? "#16A34A" : "#DC2626";
    const balanceLabel = neutro ? "Al día"   : `${positivo ? "+" : ""}S/ ${Math.abs(balance).toFixed(0)}`;

    return (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => router.push(`/groups/${group.id}` as any)}
            activeOpacity={0.78}
        >
            {/* Acento lateral */}
            <View style={[styles.cardAccent, { backgroundColor: groupColor }]} />

            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: `${groupColor}1A` }]}>
                <Text style={[styles.avatarText, { color: groupColor }]}>
                    {group.nombre?.charAt(0)?.toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View style={styles.groupInfo}>
                <Text style={styles.groupName} numberOfLines={1}>{group.nombre}</Text>
                <View style={styles.groupMeta}>
                    <Ionicons name="people-outline" size={12} color="#94A3B8" />
                    <Text style={styles.memberText}>
                        {group.cantidadMiembros || "–"} miembros
                    </Text>
                </View>
            </View>

            {/* Balance + flecha */}
            <View style={styles.groupRight}>
                <View style={[styles.balancePill, { backgroundColor: balanceBg }]}>
                    <Text style={[styles.balanceText, { color: balanceColor }]}>{balanceLabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginTop: 4 }} />
            </View>
        </TouchableOpacity>
    );
}

function EmptyState() {
    return (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={30} color={ACCENT} />
            </View>
            <Text style={styles.emptyTitle}>Sin grupos aún</Text>
            <Text style={styles.emptySubtitle}>
                Crea un grupo para empezar a dividir gastos con amigos o familia.
            </Text>
            <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => router.push("/groups/create" as any)}
                activeOpacity={0.82}
            >
                <Ionicons name="add" size={17} color={WHITE} />
                <Text style={styles.emptyActionText}>Crear primer grupo</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: SURFACE,
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 64 : 52,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: SURFACE,
        gap: 14,
    },

    loaderText: {
        color: "#94A3B8",
        fontWeight: "500",
        fontSize: 14,
    },

    // ── Header ──
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 22,
    },

    headerLeft: {
        flex: 1,
        paddingRight: 12,
    },

    title: {
        fontSize: 34,
        fontWeight: "700",
        color: "#0F172A",
        letterSpacing: -1,
        marginBottom: 5,
        lineHeight: 38,
    },

    subtitle: {
        fontSize: 13,
        color: "#94A3B8",
        fontWeight: "400",
    },

    createBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 11,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        shadowColor: NAVY,
        shadowOpacity: 0.28,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },

    createBtnText: {
        color: WHITE,
        fontWeight: "600",
        fontSize: 14,
    },

    // ── Stats ──
    statsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 26,
    },

    statCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
    },

    statIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },

    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        letterSpacing: -0.3,
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "400",
    },

    // ── List label ──
    listLabel: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 2,
        color: "#94A3B8",
        textTransform: "uppercase",
        marginBottom: 12,
        paddingLeft: 2,
    },

    // ── Group Card ──
    groupCard: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 2,
        overflow: "hidden",
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3.5,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
        marginLeft: 8,
    },

    avatarText: {
        fontSize: 20,
        fontWeight: "700",
    },

    groupInfo: {
        flex: 1,
    },

    groupName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 6,
        letterSpacing: -0.2,
    },

    groupMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    memberText: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "400",
    },

    groupRight: {
        alignItems: "flex-end",
        gap: 4,
        marginLeft: 10,
    },

    balancePill: {
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },

    balanceText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: -0.1,
    },

    // ── Empty ──
    emptyCard: {
        backgroundColor: WHITE,
        borderRadius: 24,
        padding: 34,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
        marginTop: 8,
    },

    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "#EEF1FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 8,
        letterSpacing: -0.3,
    },

    emptySubtitle: {
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 21,
        fontSize: 13,
        fontWeight: "400",
        marginBottom: 24,
        paddingHorizontal: 10,
    },

    emptyAction: {
        backgroundColor: NAVY,
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 26,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: NAVY,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 12,
        elevation: 5,
    },

    emptyActionText: {
        color: WHITE,
        fontWeight: "600",
        fontSize: 14,
    },
});
