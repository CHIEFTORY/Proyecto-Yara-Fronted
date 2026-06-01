import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { getExpenseById } from "@/src/services/expenseService";
import { getGroupUsers } from "@/src/services/groupService";
import { COLORS } from "@/src/styles/colors";

export default function ExpenseDetailScreen() {
    const { id, expenseId } = useLocalSearchParams();
    const [expense, setExpense] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadExpense = useCallback(async () => {
        try {
            setErrorMessage("");
            const [expenseData, usersData] = await Promise.all([
                getExpenseById(Number(expenseId)),
                getGroupUsers(Number(id)),
            ]);
            setExpense(expenseData);
            setUsers(usersData);
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message
                || "No pudimos cargar el detalle del gasto."
            );
        } finally {
            setLoading(false);
        }
    }, [expenseId, id]);

    useEffect(() => {
        loadExpense();
    }, [loadExpense]);

    const userById = useMemo(() => {
        const map = new Map<number, any>();
        users.forEach((user) => map.set(Number(user.id), user));
        return map;
    }, [users]);

    const participants = Array.isArray(expense?.participantes)
        ? expense.participantes
        : [];
    const categories = Array.isArray(expense?.categorias)
        ? expense.categorias
        : [];

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace(`/groups/${id}` as any)}>
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerLabel}>DETALLE</Text>
                    <Text style={styles.headerTitle}>Gasto</Text>
                </View>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                        if (expense?.id) {
                            router.push({
                                pathname: "/groups/[id]/create-expense",
                                params: { id: String(id), expenseId: String(expense.id) },
                            });
                        }
                    }}
                >
                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.stateContainer}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.stateTitle}>Cargando gasto</Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.stateContainer}>
                    <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
                    <Text style={styles.stateTitle}>No se pudo cargar</Text>
                    <Text style={styles.stateText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadExpense}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heroCard}>
                        <Text style={styles.expenseName}>{expense.descripcion}</Text>
                        <Text style={styles.expenseAmount}>S/ {Number(expense.montoTotal || 0).toFixed(2)}</Text>
                        <View style={styles.heroMetaRow}>
                            <View style={styles.metaPill}>
                                <Ionicons name="person-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.metaPillText}>Pago {expense.pagadoPor}</Text>
                            </View>
                            <View style={styles.metaPill}>
                                <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.metaPillText}>{formatDate(expense.fecha)}</Text>
                            </View>
                        </View>
                    </View>

                    <InfoGrid expense={expense} participantsCount={participants.length} categoriesCount={categories.length} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Participantes</Text>
                        {participants.map((participant: any) => {
                            const user = userById.get(Number(participant.usuarioId));
                            const initials = user?.nombre?.[0]?.toUpperCase() || "?";

                            return (
                                <View key={participant.usuarioId} style={styles.personRow}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{initials}</Text>
                                    </View>
                                    <View style={styles.personInfo}>
                                        <Text style={styles.personName}>{user?.nombre || "Usuario"}</Text>
                                        <Text style={styles.personEmail}>{user?.email || "Participante"}</Text>
                                    </View>
                                    <Text style={styles.personAmount}>
                                        S/ {Number(participant.monto || 0).toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categorias</Text>
                        {categories.length === 0 ? (
                            <Text style={styles.emptyText}>Sin categorias registradas.</Text>
                        ) : (
                            categories.map((category: any, index: number) => (
                                <View key={`${category.nombre}-${index}`} style={styles.categoryRow}>
                                    <View style={styles.categoryIcon}>
                                        <Ionicons
                                            name={categoryIcon(category.nombre) as any}
                                            size={16}
                                            color={COLORS.primary}
                                        />
                                    </View>
                                    <Text style={styles.categoryName}>{category.nombre || "Categoria"}</Text>
                                    <Text style={styles.categoryAmount}>
                                        S/ {Number(category.monto || 0).toFixed(2)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

function InfoGrid({
    expense,
    participantsCount,
    categoriesCount,
}: {
    expense: any;
    participantsCount: number;
    categoriesCount: number;
}) {
    return (
        <View style={styles.infoGrid}>
            <InfoItem label="Division" value={prettyDivision(expense.tipoDivision)} icon="git-branch-outline" />
            <InfoItem label="Estado" value={expense.estado || "Activo"} icon="checkmark-done-outline" />
            <InfoItem label="Personas" value={String(participantsCount)} icon="people-outline" />
            <InfoItem label="Categorias" value={String(categoriesCount)} icon="pricetags-outline" />
        </View>
    );
}

function InfoItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View style={styles.infoItem}>
            <Ionicons name={icon} size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

function prettyDivision(value?: string) {
    if (!value) return "Sin dato";
    if (value.toUpperCase() === "IGUAL") return "Igual";
    if (value.toUpperCase() === "PERSONALIZADO") return "Personalizado";
    return value;
}

function formatDate(value?: string) {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";

    return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
    safe: {
        flex: 1,
        backgroundColor: "#F4F7FB",
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        alignItems: "center",
    },
    headerLabel: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "900",
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    stateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
        gap: 10,
    },
    stateTitle: {
        color: "#1E293B",
        fontSize: 17,
        fontWeight: "800",
    },
    stateText: {
        color: "#64748B",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    retryText: {
        color: "#FFFFFF",
        fontWeight: "800",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 18,
        paddingBottom: 110,
    },
    heroCard: {
        backgroundColor: "#111827",
        borderRadius: 26,
        padding: 22,
        marginBottom: 16,
    },
    expenseName: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "900",
        marginBottom: 8,
    },
    expenseAmount: {
        color: "#FFFFFF",
        fontSize: 38,
        fontWeight: "900",
        marginBottom: 16,
    },
    heroMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metaPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    metaPillText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "800",
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 18,
    },
    infoItem: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    infoLabel: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "800",
        marginTop: 8,
        marginBottom: 3,
    },
    infoValue: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "900",
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sectionTitle: {
        color: "#0F172A",
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 12,
    },
    personRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "900",
    },
    personInfo: {
        flex: 1,
        minWidth: 0,
    },
    personName: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "800",
    },
    personEmail: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
    personAmount: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "900",
        marginLeft: 10,
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    categoryIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    categoryName: {
        flex: 1,
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "800",
    },
    categoryAmount: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "900",
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 13,
        fontWeight: "600",
    },
});
