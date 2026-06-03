import {
    formatTimeAgo,
} from "@/src/utils/time";
import {
    getGroupPayments,
} from "@/src/services/paymentDebtService";
import {
    getMeRequest,
} from "@/src/services/authService";
import {
    getGroupExpenses,
    deleteExpense,
} from "@/src/services/expenseService";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    StatusBar,
    Animated,
} from "react-native";
import {
    useState,
    useCallback,
    useRef,
} from "react";

import { useFocusEffect } from "@react-navigation/native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS } from "@/src/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRelativeTimeTick } from "@/src/hooks/useRelativeTimeTick";
import { useToast } from "@/src/context/ToastContext";
import { emitAppEvent, useAppRefresh } from "@/src/utils/appEvents";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";
import { useTheme } from "@/src/context/ThemeContext";

import {
    getGroupSummary,
    getGroupUsers,
    deleteGroup,
    leaveGroup,
    makeAdmin,
    removeGroupUser,
} from "@/src/services/groupService";

const getBackendMessage = (
    error: any,
    fallback: string
) => {
    const data = error?.response?.data;

    if (typeof data === "string") {
        return data;
    }

    return data?.message || fallback;
};

const buildGroupPayDebtRoute = (groupId: string | string[], deuda: any) => {
    const methods = encodeURIComponent(JSON.stringify(
        Array.isArray(deuda.metodosCobro) ? deuda.metodosCobro : []
    ));
    const yape = deuda.yapeNumero
        ? `&yapeNumero=${encodeURIComponent(String(deuda.yapeNumero))}`
        : "";

    return `/groups/${groupId}/pay-debt?deudorId=${deuda.deudorId}&acreedorId=${deuda.acreedorId}&monto=${deuda.monto}${yape}&metodosCobro=${methods}`;
};

export default function GroupDetailScreen() {
    const { colors, isDark } = useTheme();

    const { id, returnTo } = useLocalSearchParams();

    const [summary, setSummary] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("balances");
    const [expenses, setExpenses] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const now = useRelativeTimeTick();
    const toast = useToast();

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const soyAdmin = users.some(
        u => u.email === currentUser?.email && u.rol?.toUpperCase() === "ADMIN"
    );

    const openGroupMenu = () => {
        const opciones: any[] = [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Salir del grupo",
                style: "destructive",
                onPress: async () => {
                    try {
                        await leaveGroup(Number(id));
                        emitAppEvent("groups", "dashboard", "badge");
                        router.replace("/groups" as any);
                    } catch (error: any) {
                        Alert.alert(
                            "No puedes salir",
                            getBackendMessage(
                                error,
                                "Resuelve los pendientes del grupo antes de salir."
                            )
                        );
                    }
                }
            }
        ];

        if (soyAdmin) {
            opciones.push({
                text: "Editar grupo",
                onPress: () => router.push({
                    pathname: "/groups/create",
                    params: {
                        mode: "edit",
                        groupId: String(id),
                        name: summary?.nombre || "",
                        description: summary?.descripcion || "",
                        color: summary?.color || COLORS.primary,
                    },
                }),
            });

            opciones.push({
                text: "Eliminar grupo",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteGroup(Number(id));
                        emitAppEvent("groups", "dashboard", "badge");
                        router.replace("/groups" as any);
                    } catch (error: any) {
                        Alert.alert(
                            "No puedes eliminar el grupo",
                            getBackendMessage(
                                error,
                                "Resuelve los saldos y pagos pendientes antes de eliminarlo."
                            )
                        );
                    }
                }
            });
        }

        Alert.alert("Opciones del grupo", "Selecciona una opción", opciones);
    };

    const handleDeleteExpense = (expenseId: number) => {
        Alert.alert(
            "Eliminar gasto",
            "¿Seguro que deseas eliminar este gasto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteExpense(expenseId);
                            emitAppEvent("group", "groups", "dashboard", "payments", "activity");
                            toast.showToast({
                                type: "success",
                                title: "Gasto eliminado",
                                message: "El balance del grupo se actualizo.",
                            });
                            loadGroup();
                        } catch (error) {
                            console.log(error);
                            toast.showToast({
                                type: "error",
                                title: "No se pudo eliminar",
                                message: "Intenta de nuevo en unos segundos.",
                            });
                        }
                    }
                }
            ]
        );
    };

    const loadGroup = useCallback(async () => {
        try {
            const [summaryData, usersData, expensesData, paymentsData, me] =
                await Promise.all([
                    getGroupSummary(Number(id)),
                    getGroupUsers(Number(id)),
                    getGroupExpenses(Number(id)),
                    getGroupPayments(Number(id)),
                    getMeRequest(),
                ]);

            setCurrentUser(me);
            setSummary(summaryData);
            setUsers(usersData);
            setExpenses(expensesData);
            setPayments(paymentsData);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }).start();
        }
    }, [fadeAnim, id]);

    useFocusEffect(useCallback(() => { loadGroup(); }, [loadGroup]));
    useAppRefresh(["group", "payments", "activity"], loadGroup);

    if (loading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loaderText, { color: colors.subtitle }]}>Cargando grupo...</Text>
            </View>
        );
    }

    const totalGastos = expenses.reduce((acc, e) => acc + Number(e.montoTotal || 0), 0);
    const totalPagos = payments.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    const groupColor = summary?.color || COLORS.primary;
    const backTarget = returnTo === "dashboard" ? "/(tabs)" : "/groups";

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <AmbientScreenBackground intensity="medium" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER ── */}
                <View style={[styles.header, { backgroundColor: groupColor }]}>
                    {/* Círculos decorativos */}
                    <View style={styles.deco1} />
                    <View style={styles.deco2} />
                    <View style={styles.deco3} />

                    {/* Fila top: volver + settings */}
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.replace(backTarget as any)}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={openGroupMenu}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Nombre e info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.groupAvatarLarge}>
                            <Text style={styles.groupAvatarText}>
                                {summary?.nombre?.[0]?.toUpperCase() || "G"}
                            </Text>
                        </View>
                        <Text style={styles.groupName}>
                            {summary?.nombre || "Grupo"}
                        </Text>
                        <View style={styles.headerMeta}>
                            <View style={styles.metaPill}>
                                <Text style={styles.metaPillText}>
                                    {users.length} miembros
                                </Text>
                            </View>
                            {soyAdmin && (
                                <View style={[styles.metaPill, styles.adminPill]}>
                                    <Text style={styles.metaPillText}>Admin</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Stats rápidos */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>S/ {totalGastos.toFixed(2)}</Text>
                            <Text style={styles.statLabel}>Total gastos</Text>
                        </View>
                        <View style={styles.statDivider} />

                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>S/ {totalPagos.toFixed(2)}</Text>
                            <Text style={styles.statLabel}>Pagado</Text>
                        </View>
                    </View>
                </View>

                {/* ── ACCIONES ── */}
                <Animated.View style={[styles.actionsRow, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push(`/groups/${id}/create-expense`)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconBox}>
                            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.actionText}>Nuevo gasto</Text>
                    </TouchableOpacity>

                    {soyAdmin && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push(`/groups/${id}/add-member?groupName=${encodeURIComponent(summary?.nombre || "")}`)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionIconBox}>
                                <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.actionText}>Invitar</Text>
                        </TouchableOpacity>
                    )}


                </Animated.View>

                {/* ── TABS ── */}
                <Animated.View style={[styles.tabs, { opacity: fadeAnim, backgroundColor: isDark ? "#111827" : "#FFFFFF", borderColor: colors.border }]}>
                    {["balances", "gastos", "pagos"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.tabText, { color: colors.subtitle }, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* ── TAB: BALANCES ── */}
                {activeTab === "balances" && (
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* Miembros */}
                        <View style={styles.listContainer}>
                            <Text style={[styles.subSectionTitle, { color: colors.text }]}>Miembros</Text>
                            {users.map((user) => {
                                const balance = summary?.balances?.find(
                                    (b: any) => b.usuarioId === user.id
                                );
                                const monto = balance?.balance || 0;
                                const positive = monto > 0;
                                const emptyBalance = monto === 0;

                                return (
                                    <View key={user.id} style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={[
                                            styles.avatar,
                                            { backgroundColor: positive ? "#DCFCE7" : emptyBalance ? "#E0E7FF" : "#FEE2E2" }
                                        ]}>
                                            <Text style={[
                                                styles.avatarText,
                                                { color: positive ? "#16A34A" : emptyBalance ? COLORS.primary : "#DC2626" }
                                            ]}>
                                                {user.nombre.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>

                                        <View style={styles.userInfo}>
                                            <View style={styles.nameRow}>
                                                <Text numberOfLines={1} style={[styles.userName, { color: colors.text }]}>
                                                    {user.nombre}
                                                </Text>
                                                {user.rol === "ADMIN" && (
                                                    <View style={styles.adminBadge}>
                                                        <Text style={styles.adminText}>Admin</Text>
                                                    </View>
                                                )}
                                                {soyAdmin && user.rol !== "ADMIN" && currentUser?.id !== user.id && (
                                                    <TouchableOpacity
                                                        style={styles.userMenuButton}
                                                        onPress={() => {
                                                            Alert.alert(user.nombre, "Opciones del usuario", [
                                                                { text: "Cancelar", style: "cancel" },
                                                                {
                                                                    text: "Hacer administrador",
                                                                    onPress: async () => {
                                                                        try {
                                                                            await makeAdmin(Number(id), user.id);
                                                                            toast.showToast({
                                                                                type: "success",
                                                                                title: "Administrador asignado",
                                                                                message: `${user.nombre} ahora puede gestionar el grupo.`,
                                                                            });
                                                                            loadGroup();
                                                                        } catch (error: any) {
                                                                            toast.showToast({
                                                                                type: "error",
                                                                                title: "No se pudo asignar",
                                                                                message: error?.response?.data?.message || "Intenta nuevamente.",
                                                                            });
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: "Eliminar del grupo",
                                                                    style: "destructive",
                                                                    onPress: async () => {
                                                                        try {
                                                                            await removeGroupUser(Number(id), user.id);
                                                                            emitAppEvent("group", "groups", "dashboard", "payments", "activity");
                                                                            toast.showToast({
                                                                                type: "success",
                                                                                title: "Miembro eliminado",
                                                                                message: `${user.nombre} ya no pertenece al grupo.`,
                                                                            });
                                                                            loadGroup();
                                                                        } catch (error: any) {
                                                                            Alert.alert(
                                                                                "No puedes eliminarlo",
                                                                                getBackendMessage(
                                                                                    error,
                                                                                    "Resuelve los pendientes de este miembro antes de eliminarlo."
                                                                                )
                                                                            );
                                                                        }
                                                                    }
                                                                }
                                                            ]);
                                                        }}
                                                    >
                                                        <Text style={styles.userMenuText}>⋮</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <Text numberOfLines={1} style={[styles.userEmail, { color: colors.subtitle }]}>
                                                {user.email}
                                            </Text>
                                        </View>

                                        {/* Balance pill */}
                                        <View style={[
                                            styles.balancePill,
                                            {
                                                backgroundColor:
                                                    emptyBalance ? (isDark ? "#111827" : "#F1F5F9") :
                                                        positive ? "#DCFCE7" : "#FEE2E2"
                                            }
                                        ]}>
                                            <Text style={[
                                                styles.balancePillText,
                                                {
                                                    color:
                                                        emptyBalance ? "#94A3B8" :
                                                            positive ? "#16A34A" : "#DC2626"
                                                }
                                            ]}>
                                                {emptyBalance
                                                    ? "Al día"
                                                    : `${positive ? "+" : "-"}S/ ${Math.abs(monto).toFixed(2)}`
                                                }
                                            </Text>
                                            {!emptyBalance && (
                                                <Text style={[
                                                    styles.balancePillSub,
                                                    { color: positive ? "#16A34A" : "#DC2626" }
                                                ]}>
                                                    {positive ? "recibe" : "debe"}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Deudas pendientes */}
                        <View style={styles.listContainer}>
                            <Text style={[styles.subSectionTitle, { color: colors.text }]}>Deudas pendientes</Text>

                            {summary?.deudas?.length === 0 ? (
                                <View style={[styles.emptyMini, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="checkmark-circle-outline" size={36} color="#16A34A" />
                                    <Text style={[styles.emptyMiniText, { color: colors.text }]}>Sin deudas pendientes</Text>
                                    <Text style={[styles.emptyMiniSubText, { color: colors.subtitle }]}>
                                        Cuando registres gastos compartidos, aqui veras quien debe pagarle a quien.
                                    </Text>
                                </View>
                            ) : (
                                summary?.deudas?.map((deuda: any, index: number) => (
                                    <View key={index} style={[styles.debtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={styles.debtIconBox}>
                                            <Ionicons name="cash-outline" size={19} color="#B45309" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.debtDescription, { color: colors.text }]}>
                                                <Text style={styles.bold}>{deuda.deudor}</Text>
                                                {" debe a "}
                                                <Text style={styles.bold}>{deuda.acreedor}</Text>
                                            </Text>
                                            <Text style={styles.debtAmount}>
                                                S/ {Number(deuda.monto).toFixed(2)}
                                            </Text>
                                        </View>

                                        {currentUser?.nombre === deuda.deudor && (
                                            <TouchableOpacity
                                                style={styles.payButton}
                                                onPress={() => {
                                                    router.push(
                                                        buildGroupPayDebtRoute(id, deuda) as any
                                                    );
                                                }}
                                            >
                                                <Text style={styles.payButtonText}>Pagar</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    </Animated.View>
                )}

                {/* ── TAB: GASTOS ── */}
                {activeTab === "gastos" && (
                    <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
                        <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                            {expenses.length} gasto{expenses.length !== 1 ? "s" : ""} registrado{expenses.length !== 1 ? "s" : ""}
                        </Text>

                        {expenses.length === 0 ? (
                            <View style={[styles.emptyMini, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="receipt-outline" size={36} color={COLORS.primary} />
                                <Text style={[styles.emptyMiniText, { color: colors.text }]}>No hay gastos registrados</Text>
                                <Text style={[styles.emptyMiniSubText, { color: colors.subtitle }]}>
                                    {users.length <= 1
                                        ? "Invita a alguien para dividir gastos con otra persona."
                                        : "Crea el primer gasto para empezar a calcular balances."}
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyMiniButton}
                                    onPress={() => {
                                        if (users.length <= 1 && soyAdmin) {
                                            router.push(`/groups/${id}/add-member?groupName=${encodeURIComponent(summary?.nombre || "")}` as any);
                                            return;
                                        }

                                        router.push(`/groups/${id}/create-expense` as any);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.emptyMiniButtonText}>
                                        {users.length <= 1 && soyAdmin ? "Invitar miembro" : "Crear primer gasto"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            expenses.map((expense) => {
                                const firstCategory = expense.categorias?.[0]?.nombre;

                                return (
                                <TouchableOpacity
                                    key={expense.id}
                                    style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => {
                                        router.push(
                                            `/groups/${id}/expense-detail?expenseId=${expense.id}` as any
                                        );
                                    }}
                                    activeOpacity={0.82}
                                >
                                    <View style={styles.expenseLeft}>
                                        <View style={styles.expenseIcon}>
                                            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.descripcion}</Text>
                                            <Text style={[styles.expenseSubtitle, { color: colors.subtitle }]}>Pagó {expense.pagadoPor}</Text>
                                            {firstCategory && (
                                                <View style={styles.categoryBadge}>
                                                    <Ionicons
                                                        name={categoryIcon(firstCategory) as any}
                                                        size={11}
                                                        color={COLORS.primary}
                                                    />
                                                    <Text style={styles.categoryBadgeText}>{firstCategory}</Text>
                                                </View>
                                            )}
                                            <Text style={[styles.expenseTime, { color: colors.subtitle }]}>{formatTimeAgo(expense.fecha, now)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.expenseRight}>
                                        {soyAdmin && (
                                            <TouchableOpacity
                                                onPress={(event: any) => {
                                                    event.stopPropagation?.();
                                                    Alert.alert("Opciones", "", [
                                                        { text: "Cancelar", style: "cancel" },
                                                        {
                                                            text: "Editar",
                                                            onPress: () => router.push({
                                                                pathname: "/groups/[id]/create-expense",
                                                                params: { id: String(id), expenseId: String(expense.id) }
                                                            })
                                                        },
                                                        {
                                                            text: "Eliminar",
                                                            style: "destructive",
                                                            onPress: () => handleDeleteExpense(expense.id)
                                                        }
                                                    ]);
                                                }}
                                            >
                                                <Text style={styles.expenseMenu}>⋮</Text>
                                            </TouchableOpacity>
                                        )}
                                        <Text style={styles.expenseAmount}>
                                            S/ {Number(expense.montoTotal).toFixed(2)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                );
                            })
                        )}
                    </Animated.View>
                )}

                {/* ── TAB: PAGOS ── */}
                {activeTab === "pagos" && (
                    <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
                        <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                            {payments.length} pago{payments.length !== 1 ? "s" : ""} registrado{payments.length !== 1 ? "s" : ""}
                        </Text>

                        {payments.length === 0 ? (
                            <View style={[styles.emptyMini, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="card-outline" size={36} color={COLORS.primary} />
                                <Text style={[styles.emptyMiniText, { color: colors.text }]}>No hay pagos registrados</Text>
                                <Text style={[styles.emptyMiniSubText, { color: colors.subtitle }]}>
                                    Aparecerán cuando alguien pague una deuda y el acreedor la confirme.
                                </Text>
                            </View>
                        ) : (
                            payments.map((payment) => (
                                <View key={payment.id} style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={styles.expenseLeft}>
                                        <View style={[styles.expenseIcon, { backgroundColor: "#DCFCE7" }]}>
                                            <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.expenseTitle, { color: colors.text }]}>{payment.deudor}</Text>
                                            <Text style={[styles.expenseSubtitle, { color: colors.subtitle }]}>Pagó a {payment.acreedor}</Text>
                                            <View style={styles.metodoPagoBadge}>
                                                <Text style={styles.metodoPagoText}>{payment.metodoPago}</Text>
                                            </View>
                                            <Text style={[styles.expenseTime, { color: colors.subtitle }]}>{formatTimeAgo(payment.fecha, now)}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.expenseAmount, { color: "#16A34A" }]}>
                                        +S/ {Number(payment.monto).toFixed(2)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </Animated.View>
                )}

            </ScrollView>
        </View>
    );
}

function categoryIcon(name?: string) {
    const normalized = String(name || "").toLowerCase();
    if (normalized.includes("comida")) return "restaurant-outline";
    if (normalized.includes("transporte")) return "car-outline";
    if (normalized.includes("casa")) return "home-outline";
    if (normalized.includes("servicio")) return "flash-outline";
    if (normalized.includes("compra")) return "bag-outline";
    if (normalized.includes("salud")) return "medkit-outline";
    if (normalized.includes("ocio")) return "game-controller-outline";
    return "pricetag-outline";
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    container: {
        flex: 1,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        backgroundColor: "#F0F4FF",
    },

    loaderText: {
        color: "#94A3B8",
        fontWeight: "600",
        fontSize: 15,
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 32,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: "hidden",
        position: "relative",
    },

    deco1: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
        top: -70,
        right: -50,
    },

    deco2: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: -30,
        left: -20,
    },

    deco3: {
        position: "absolute",
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.06)",
        top: 30,
        left: 80,
    },

    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        zIndex: 2,
    },

    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    backArrow: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    settingsButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },

    settingsIcon: {
        fontSize: 18,
    },

    headerInfo: {
        alignItems: "center",
        marginBottom: 24,
        zIndex: 2,
    },

    groupAvatarLarge: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
    },

    groupAvatarText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
    },

    groupName: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
        textAlign: "center",
        marginBottom: 12,
    },

    headerMeta: {
        flexDirection: "row",
        gap: 8,
    },

    metaPill: {
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 14,
    },

    adminPill: {
        backgroundColor: "rgba(253,224,71,0.25)",
    },

    metaPillText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        fontWeight: "700",
    },

    /* Stats */
    statsRow: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 10,
        zIndex: 2,
    },

    statItem: {
        flex: 1,
        alignItems: "center",
    },

    statValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
    },

    statLabel: {
        fontSize: 11,
        color: "rgba(255,255,255,0.6)",
        marginTop: 4,
        fontWeight: "600",
    },

    statDivider: {
        width: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginVertical: 4,
    },

    /* ── ACCIONES ── */
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },

    actionButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: "center",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
        gap: 6,
    },

    actionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },

    actionEmoji: {
        fontSize: 18,
    },

    actionText: {
        color: COLORS.text,
        fontWeight: "700",
        fontSize: 11,
        textAlign: "center",
    },

    /* ── TABS ── */
    tabs: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        marginHorizontal: 20,
        borderRadius: 18,
        padding: 5,
        marginTop: 22,
        marginBottom: 4,
    },

    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
    },

    activeTab: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },

    tabText: {
        color: "#94A3B8",
        fontWeight: "700",
        fontSize: 14,
    },

    activeTabText: {
        color: COLORS.text,
    },

    /* ── LISTS ── */
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    subSectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 14,
        letterSpacing: -0.2,
    },

    /* ── USER CARD ── */
    userCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 2,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    avatarText: {
        fontWeight: "800",
        fontSize: 20,
    },

    userInfo: {
        flex: 1,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
    },

    userName: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
        maxWidth: "65%",
    },

    userEmail: {
        color: COLORS.subtitle,
        marginTop: 3,
        fontSize: 12,
    },

    adminBadge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },

    adminText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: "800",
    },

    userMenuButton: {
        width: 28,
        height: 28,
        borderRadius: 9,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },

    userMenuText: {
        fontSize: 16,
        color: COLORS.subtitle,
        fontWeight: "bold",
    },

    /* Balance pill */
    balancePill: {
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "center",
        minWidth: 72,
        marginLeft: 8,
    },

    balancePillText: {
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: -0.3,
    },

    balancePillSub: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },

    /* ── DEBT CARD ── */
    debtCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 2,
    },

    debtIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FEF9C3",
        alignItems: "center",
        justifyContent: "center",
    },

    debtDescription: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 4,
    },

    debtAmount: {
        fontSize: 18,
        fontWeight: "800",
        color: "#DC2626",
        letterSpacing: -0.3,
    },

    bold: {
        fontWeight: "700",
    },

    payButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
    },

    payButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },

    /* ── EXPENSE CARD ── */
    expenseCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 2,
    },

    expenseLeft: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        gap: 12,
    },

    expenseIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
    },

    expenseEmoji: {
        fontSize: 20,
    },

    expenseTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 3,
    },

    expenseSubtitle: {
        color: COLORS.subtitle,
        fontSize: 12,
        marginBottom: 2,
    },

    categoryBadge: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#EEF2FF",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 4,
        marginBottom: 2,
    },

    categoryBadgeText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "800",
    },

    expenseTime: {
        color: "#CBD5E1",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },

    expenseRight: {
        alignItems: "flex-end",
        gap: 6,
        marginLeft: 10,
    },

    expenseAmount: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.text,
        letterSpacing: -0.3,
    },

    expenseMenu: {
        fontSize: 20,
        color: COLORS.subtitle,
    },

    /* Método de pago badge */
    metodoPagoBadge: {
        backgroundColor: "#F0FDF4",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "flex-start",
        marginTop: 3,
        marginBottom: 2,
    },

    metodoPagoText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#16A34A",
    },

    /* ── EMPTY STATES ── */
    emptyMini: {
        alignItems: "center",
        paddingVertical: 36,
        gap: 10,
    },

    emptyMiniEmoji: {
        fontSize: 40,
    },

    emptyMiniText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#94A3B8",
        textAlign: "center",
    },

    emptyMiniSubText: {
        maxWidth: 280,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: "500",
        color: "#64748B",
        textAlign: "center",
    },

    emptyMiniButton: {
        marginTop: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },

    emptyMiniButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },
});
