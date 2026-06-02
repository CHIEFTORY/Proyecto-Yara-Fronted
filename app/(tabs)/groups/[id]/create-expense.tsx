import {
    createExpense,
    getExpenseCategories,
    getExpenseById,
    updateExpense,
} from "@/src/services/expenseService";

import {
    Alert,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS } from "@/src/styles/colors";
import { getGroupUsers } from "@/src/services/groupService";
import { Ionicons } from "@expo/vector-icons";
import { emitAppEvent } from "@/src/utils/appEvents";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

const AVATAR_COLORS = [
    { bg: "#DBEAFE", text: "#2563EB" },
    { bg: "#DCFCE7", text: "#16A34A" },
    { bg: "#EDE9FE", text: "#7C3AED" },
    { bg: "#FEF3C7", text: "#D97706" },
    { bg: "#FCE7F3", text: "#DB2777" },
    { bg: "#CFFAFE", text: "#0891B2" },
];

const FALLBACK_CATEGORIES = [
    { id: 1, nombre: "General", icon: "pricetag-outline" },
    { id: 2, nombre: "Comida", icon: "restaurant-outline" },
    { id: 3, nombre: "Transporte", icon: "car-outline" },
    { id: 4, nombre: "Casa", icon: "home-outline" },
    { id: 5, nombre: "Servicios", icon: "flash-outline" },
    { id: 6, nombre: "Compras", icon: "bag-outline" },
    { id: 7, nombre: "Salud", icon: "medkit-outline" },
    { id: 8, nombre: "Ocio", icon: "game-controller-outline" },
] as const;

const categoryIcon = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes("comida")) return "restaurant-outline";
    if (normalized.includes("transporte")) return "car-outline";
    if (normalized.includes("casa")) return "home-outline";
    if (normalized.includes("servicio")) return "flash-outline";
    if (normalized.includes("compra")) return "bag-outline";
    if (normalized.includes("salud")) return "medkit-outline";
    if (normalized.includes("ocio")) return "game-controller-outline";
    return "pricetag-outline";
};

export default function CreateExpenseScreen() {

    const { id, expenseId } = useLocalSearchParams();
    const editing = !!expenseId;

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [splitType, setSplitType] = useState("IGUAL");
    const [users, setUsers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([...FALLBACK_CATEGORIES]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
    const [paidBy, setPaidBy] = useState<number | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [customAmounts, setCustomAmounts] = useState<any>({});
    const [descFocused, setDescFocused] = useState(false);
    const [amountFocused, setAmountFocused] = useState(false);
    const [saving, setSaving] = useState(false);

    const applyExpenseData = (data: any) => {
        setDescription(data.descripcion);
        setAmount(String(data.montoTotal));
        setSplitType(data.tipoDivision);
        setPaidBy(data.pagadoPorId);
        setSelectedCategoryId(data.categorias?.[0]?.id || 1);
        setSelectedUsers(data.participantes.map((p: any) => p.usuarioId));
        const amounts: any = {};
        data.participantes.forEach((p: any) => { amounts[p.usuarioId] = String(p.monto); });
        setCustomAmounts(amounts);
    };

    const loadInitialData = useCallback(async () => {
        try {
            const usersData = await getGroupUsers(Number(id));
            setUsers(usersData);
            getExpenseCategories()
                .then((categoriesData) => {
                    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                        setCategories(categoriesData);
                    }
                })
                .catch(() => {});
            if (editing) {
                const expenseData = await getExpenseById(Number(expenseId));
                applyExpenseData(expenseData);
                return;
            }
            if (usersData.length > 0) setPaidBy(usersData[0].id);
            setSelectedUsers(usersData.map((u: any) => u.id));
        } catch (error) {
            console.log(error);
        }
    }, [editing, expenseId, id]);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);
    useEffect(() => { if (splitType === "IGUAL") setCustomAmounts({}); }, [splitType]);

    const toggleUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const equalAmount = () => {
        if (!amount || selectedUsers.length === 0) return "0.00";
        return (Math.floor((Number(amount) * 100) / selectedUsers.length) / 100).toFixed(2);
    };

    const splitEqualAmounts = () => {
        if (!amount || selectedUsers.length === 0) return new Map<number, number>();

        const cents = Math.round(Number(amount) * 100);
        const base = Math.floor(cents / selectedUsers.length);
        const remainder = cents - base * selectedUsers.length;

        return new Map(
            selectedUsers.map((userId, index) => [
                userId,
                (base + (index < remainder ? 1 : 0)) / 100,
            ])
        );
    };

    const customTotal = () => {
        return Object.values(customAmounts)
            .reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)
            .toFixed(2);
    };

    const payerLabel = (user: any) => {
        const parts = String(user.nombre || "").trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0];
        const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
        if (firstName && lastName) return `${firstName} ${lastName.charAt(0)}.`;
        return firstName || String(user.email || "").split("@")[0] || "Usuario";
    };

    const getUserLabel = (userId: number) => {
        const user = users.find((item) => item.id === userId);
        return user ? payerLabel(user) : "Usuario";
    };

    const previewRows = () => {
        if (!amount || Number(amount) <= 0) return [];

        if (splitType === "IGUAL") {
            const amounts = splitEqualAmounts();
            return selectedUsers.map((userId) => ({
                userId,
                name: getUserLabel(userId),
                amount: amounts.get(userId) || 0,
            }));
        }

        return users
            .filter((user) => Number(customAmounts[user.id]) > 0)
            .map((user) => ({
                userId: user.id,
                name: payerLabel(user),
                amount: Number(customAmounts[user.id]),
            }));
    };

    const payerShare = () => {
        const row = previewRows().find((item) => item.userId === paidBy);
        return row?.amount || 0;
    };

    const payerReceives = () => {
        if (!amount || !paidBy) return 0;
        return Math.max(Number(amount) - payerShare(), 0);
    };

    const handleSave = async () => {
        if (saving) return;

        try {
            setSaving(true);
            if (!description || !amount) {
                Alert.alert("Campos incompletos", "Completa la descripción y el monto.");
                return;
            }
            if (splitType === "IGUAL" && selectedUsers.length === 0) {
                Alert.alert("Sin participantes", "Selecciona al menos un participante.");
                return;
            }

            let participantes: any[] = [];

            if (splitType === "IGUAL") {
                const amounts = splitEqualAmounts();
                participantes = selectedUsers.map(userId => ({
                    usuarioId: userId,
                    monto: amounts.get(userId) || 0,
                }));
            } else {
                participantes = users
                    .filter(user => Number(customAmounts[user.id]) > 0)
                    .map(user => ({ usuarioId: user.id, monto: Number(customAmounts[user.id]) }));

                if (participantes.length === 0) {
                    Alert.alert("Sin participantes", "Ingresa al menos un monto.");
                    return;
                }
                if (!participantes.some(p => p.usuarioId === paidBy)) {
                    Alert.alert("Error", "La persona que pagó debe participar en el gasto.");
                    return;
                }
                const total = participantes.reduce((sum, p) => sum + p.monto, 0);
                if (Number(total.toFixed(2)) !== Number(amount)) {
                    Alert.alert("Montos incorrectos", `La suma (S/ ${total.toFixed(2)}) no coincide con el total (S/ ${amount}).`);
                    return;
                }
            }

            const payload = {
                grupoId: Number(id),
                pagadoPorId: paidBy,
                descripcion: description,
                monto: Number(amount),
                tipoDivision: splitType,
                participantes,
                categorias: [{ categoriaId: selectedCategoryId, monto: Number(amount) }],
            };

            if (editing) {
                await updateExpense(Number(expenseId), payload);
            } else {
                await createExpense(payload);
            }

            emitAppEvent("group", "groups", "dashboard", "payments", "activity", "badge");
            Alert.alert("Listo", editing ? "Gasto actualizado correctamente." : "Gasto registrado correctamente.");
            router.replace(`/groups/${id}` as any);

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo guardar el gasto.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle="light-content" />
            <AmbientScreenBackground />

            {/* ── HEADER ── */}
            <View style={styles.header}>
                <View style={styles.deco1} />
                <View style={styles.deco2} />

                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.replace(`/groups/${id}` as any)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {editing ? "Editar gasto" : "Nuevo gasto"}
                    </Text>
                    <View style={{ width: 42 }} />
                </View>

                {/* Monto preview en el header */}
                <View style={styles.amountPreview}>
                    <Text style={styles.amountPreviewLabel}>Monto total</Text>
                    <Text style={styles.amountPreviewValue}>
                        S/ {amount ? Number(amount).toFixed(2) : "0.00"}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                {/* ── CARD: DETALLES ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Detalles del gasto</Text>

                    <Text style={styles.label}>Descripción</Text>
                    <View style={[styles.inputWrapper, descFocused && styles.inputFocused]}>
                        <Ionicons name="document-text-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Ej: Pizza, supermercado, Uber..."
                            placeholderTextColor="#CBD5E1"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.input}
                            onFocus={() => setDescFocused(true)}
                            onBlur={() => setDescFocused(false)}
                        />
                    </View>

                    <Text style={styles.label}>Monto total</Text>
                    <View style={[styles.inputWrapper, styles.amountInputWrapper, amountFocused && styles.inputFocused]}>
                        <Text style={styles.currencyTag}>S/</Text>
                        <TextInput
                            placeholder="0.00"
                            placeholderTextColor="#CBD5E1"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            style={[styles.input, styles.amountInput]}
                            onFocus={() => setAmountFocused(true)}
                            onBlur={() => setAmountFocused(false)}
                        />
                    </View>

                    <Text style={styles.label}>Categoría</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryRow}
                    >
                        {categories.map((category: any) => {
                            const categoryId = category.id;
                            const active = selectedCategoryId === categoryId;

                            return (
                                <TouchableOpacity
                                    key={categoryId}
                                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                                    onPress={() => setSelectedCategoryId(categoryId)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={categoryIcon(category.nombre) as any}
                                        size={17}
                                        color={active ? "#FFFFFF" : COLORS.primary}
                                    />
                                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                                        {category.nombre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ── CARD: PAGADO POR ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>¿Quién pagó?</Text>
                    <Text style={styles.cardSubtitle}>Esta persona pagó el gasto completo.</Text>

                    <View style={styles.payerRow}>
                        {users.map((user, index) => {
                            const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            const active = paidBy === user.id;
                            return (
                                <TouchableOpacity
                                    key={user.id}
                                    style={[
                                        styles.payerChip,
                                        active && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                                    ]}
                                    onPress={() => setPaidBy(user.id)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[
                                        styles.payerAvatar,
                                        { backgroundColor: active ? "rgba(255,255,255,0.25)" : palette.bg }
                                    ]}>
                                        <Text style={[
                                            styles.payerAvatarText,
                                            { color: active ? "#FFFFFF" : palette.text }
                                        ]}>
                                            {user.nombre.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.payerName,
                                        active && { color: "#FFFFFF" }
                                    ]}>
                                        {payerLabel(user)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── CARD: DIVISIÓN ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tipo de división</Text>

                    <View style={styles.splitToggle}>
                        <TouchableOpacity
                            style={[styles.splitBtn, splitType === "IGUAL" && styles.splitBtnActive]}
                            onPress={() => setSplitType("IGUAL")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="scale-outline" size={17} color={splitType === "IGUAL" ? "#FFFFFF" : COLORS.primary} />
                            <Text style={[styles.splitBtnText, splitType === "IGUAL" && styles.splitBtnTextActive]}>
                                Igualitario
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.splitBtn, splitType === "PERSONALIZADO" && styles.splitBtnActive]}
                            onPress={() => setSplitType("PERSONALIZADO")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="create-outline" size={17} color={splitType === "PERSONALIZADO" ? "#FFFFFF" : COLORS.primary} />
                            <Text style={[styles.splitBtnText, splitType === "PERSONALIZADO" && styles.splitBtnTextActive]}>
                                Personalizado
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── CARD: PARTICIPANTES ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Participantes</Text>
                    <View style={styles.participantsMeta}>
                        <View style={styles.participantsMetaItem}>
                            <Ionicons name="people-outline" size={15} color={COLORS.primary} />
                            <Text style={styles.participantsMetaText}>
                                {splitType === "IGUAL" ? selectedUsers.length : Object.values(customAmounts).filter(Boolean).length} incluidos
                            </Text>
                        </View>
                        <View style={styles.participantsMetaItem}>
                            <Ionicons name="git-branch-outline" size={15} color={COLORS.primary} />
                            <Text style={styles.participantsMetaText}>
                                {splitType === "IGUAL" ? "Division igual" : "Division manual"}
                            </Text>
                        </View>
                    </View>
                    {splitType === "PERSONALIZADO" && (
                        <Text style={styles.cardSubtitle}>
                            Ingresa cuánto debe cada persona. Deja vacío para excluirla.
                        </Text>
                    )}

                    {users.map((user, index) => {
                        const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
                        const selected = selectedUsers.includes(user.id);

                        return (
                            <TouchableOpacity
                                key={user.id}
                                style={[
                                    styles.userRow,
                                    selected && splitType === "IGUAL" && styles.userRowSelected,
                                ]}
                                onPress={() => {
                                    if (splitType === "IGUAL") toggleUser(user.id);
                                }}
                                activeOpacity={splitType === "IGUAL" ? 0.75 : 1}
                            >

                                <View style={styles.userLeft}>
                                    <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
                                        <Text style={[styles.avatarText, { color: palette.text }]}>
                                            {user.nombre.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    <View>
                                        <Text style={styles.userName}>{user.nombre}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                </View>

                                {splitType === "PERSONALIZADO" ? (
                                    <>
                                        <Text
                                            style={{
                                                marginTop: 12,
                                                marginBottom: 8,
                                                fontSize: 12,
                                                fontWeight: "600",
                                                color: "#64748B",
                                            }}
                                        >
                                            Monto asignado
                                        </Text>

                                        <View style={styles.customInputWrapper}>
                                            <Text style={styles.customCurrency}>S/</Text>

                                            <TextInput
                                                placeholder="0.00"
                                                placeholderTextColor="#CBD5E1"
                                                keyboardType="numeric"
                                                style={styles.customInput}
                                                value={customAmounts[user.id] || ""}
                                                onChangeText={(value) =>
                                                    setCustomAmounts({
                                                        ...customAmounts,
                                                        [user.id]: value,
                                                    })
                                                }
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                                        {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                    </View>
                                )}

                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── RESUMEN ── */}
                {splitType === "IGUAL" && amount && selectedUsers.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryLeft}>
                            <Text style={styles.summaryLabel}>Cada persona paga</Text>
                            <Text style={styles.summaryAmount}>S/ {equalAmount()}</Text>
                        </View>
                        <View style={styles.summaryRight}>
                            <Text style={styles.summaryDetail}>{selectedUsers.length} participante{selectedUsers.length !== 1 ? "s" : ""}</Text>
                            <Text style={styles.summaryDetail}>Total: S/ {Number(amount).toFixed(2)}</Text>
                        </View>
                    </View>
                )}

                {splitType === "PERSONALIZADO" && (
                    <View style={[
                        styles.summaryCard,
                        Number(customTotal()) === Number(amount) && amount
                            ? styles.summaryCardOk
                            : styles.summaryCardWarn
                    ]}>
                        <View style={styles.summaryLeft}>
                            <Text style={styles.summaryLabel}>Suma asignada</Text>
                            <Text style={styles.summaryAmount}>S/ {customTotal()}</Text>
                        </View>
                        <View style={styles.summaryRight}>
                            <Text style={styles.summaryDetail}>Total: S/ {Number(amount || 0).toFixed(2)}</Text>
                            <Text style={[
                                styles.summaryStatus,
                                Number(customTotal()) === Number(amount) && amount
                                    ? { color: "#16A34A" }
                                    : { color: "#D97706" }
                            ]}>
                                {Number(customTotal()) === Number(amount) && amount ? "Cuadra" : "No cuadra"}
                            </Text>
                        </View>
                    </View>
                )}

                {amount && paidBy && previewRows().length > 0 && (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <View>
                                <Text style={styles.previewTitle}>Vista previa</Text>
                                <Text style={styles.previewSubtitle}>
                                    {getUserLabel(paidBy)} pagó el total
                                </Text>
                            </View>
                            <View style={styles.previewReceiveBadge}>
                                <Text style={styles.previewReceiveLabel}>Recupera</Text>
                                <Text style={styles.previewReceiveAmount}>
                                    S/ {payerReceives().toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {previewRows().map((row) => (
                            <View key={row.userId} style={styles.previewRow}>
                                <Text style={styles.previewName}>{row.name}</Text>
                                <Text style={[
                                    styles.previewAmount,
                                    row.userId === paidBy && styles.previewAmountMuted,
                                ]}>
                                    {row.userId === paidBy ? "Su parte " : ""}
                                    S/ {row.amount.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── BOTÓN GUARDAR ── */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <View style={styles.saveBtnContent}>
                            <Text style={styles.saveBtnText}>
                                {editing ? "Actualizar gasto" : "Guardar gasto"}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.replace(`/groups/${id}` as any)}
                    activeOpacity={0.75}
                >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
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
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(255,255,255,0.05)",
        bottom: -30,
        left: 20,
    },

    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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

    headerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.2,
    },

    amountPreview: {
        alignItems: "center",
        zIndex: 2,
    },

    amountPreviewLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 6,
    },

    amountPreviewValue: {
        fontSize: 44,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -1,
    },

    /* ── SCROLL ── */
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    /* ── CARDS ── */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 22,
        marginBottom: 16,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 14,
        elevation: 3,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 4,
        letterSpacing: -0.2,
    },

    cardSubtitle: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "500",
        marginBottom: 16,
        lineHeight: 18,
    },

    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        letterSpacing: 0.3,
        marginBottom: 8,
        marginTop: 14,
    },

    /* Inputs */
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        gap: 10,
        marginBottom: 4,
    },

    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: "#EFF6FF",
    },

    amountInputWrapper: {
        minHeight: 72,
        backgroundColor: "#F8FBFF",
        borderColor: "#BFDBFE",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 14,
        elevation: 2,
    },

    inputIcon: {
        fontSize: 16,
    },

    currencyTag: {
        fontSize: 18,
        fontWeight: "800",
        color: "#94A3B8",
    },

    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "500",
    },

    amountInput: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1E293B",
    },

    categoryRow: {
        gap: 10,
        paddingRight: 4,
        paddingBottom: 2,
    },

    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "#F8FAFC",
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingVertical: 10,
        paddingHorizontal: 13,
    },

    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    categoryText: {
        color: "#475569",
        fontSize: 13,
        fontWeight: "800",
    },

    categoryTextActive: {
        color: "#FFFFFF",
    },

    /* Payer */
    payerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 8,
    },

    payerChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F1F5F9",
        borderRadius: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },

    payerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },

    payerAvatarText: {
        fontSize: 13,
        fontWeight: "800",
    },

    payerName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
    },

    /* Split toggle */
    splitToggle: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: 18,
        padding: 4,
        gap: 6,
        marginTop: 8,
    },

    splitBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 14,
        gap: 6,
    },

    splitBtnActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },

    splitBtnEmoji: {
        fontSize: 15,
    },

    splitBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#94A3B8",
    },

    splitBtnTextActive: {
        color: "#1E293B",
    },

    /* User rows */
    userRow: {
        padding: 14,
        borderRadius: 18,
        marginBottom: 12,
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: "transparent",
    },

    userRowSelected: {
        backgroundColor: "#EFF6FF",
        borderColor: "#BFDBFE",
    },

    participantsMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
        marginBottom: 12,
    },

    participantsMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EEF2FF",
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 7,
    },

    participantsMetaText: {
        color: "#475569",
        fontSize: 12,
        fontWeight: "800",
    },

    userLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    avatarText: {
        fontWeight: "800",
        fontSize: 18,
    },

    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2,
    },

    userEmail: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "500",
    },

    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        alignItems: "center",
        justifyContent: "center",
    },

    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    checkboxCheck: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    customInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 14,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        marginTop: 4,
    },

    customCurrency: {
        fontSize: 13,
        fontWeight: "700",
        color: "#94A3B8",
    },

    customInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },

    /* ── SUMMARY CARD ── */
    summaryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },

    summaryCardOk: {
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
    },

    summaryCardWarn: {
        backgroundColor: "#FFFBEB",
        borderColor: "#FDE68A",
    },

    summaryLeft: {},

    summaryLabel: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
        marginBottom: 4,
    },

    summaryAmount: {
        fontSize: 28,
        fontWeight: "800",
        color: COLORS.primary,
        letterSpacing: -0.5,
    },

    summaryRight: {
        alignItems: "flex-end",
        gap: 4,
    },

    summaryDetail: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "600",
    },

    summaryStatus: {
        fontSize: 13,
        fontWeight: "800",
    },

    /* ── BOTONES ── */
    previewCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
    },

    previewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 12,
    },

    previewTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1E293B",
    },

    previewSubtitle: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
        marginTop: 3,
    },

    previewReceiveBadge: {
        backgroundColor: "#F0FDF4",
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: "flex-end",
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },

    previewReceiveLabel: {
        fontSize: 10,
        color: "#16A34A",
        fontWeight: "700",
        textTransform: "uppercase",
    },

    previewReceiveAmount: {
        fontSize: 16,
        color: "#15803D",
        fontWeight: "800",
        marginTop: 2,
    },

    previewRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },

    previewName: {
        flex: 1,
        fontSize: 14,
        color: "#334155",
        fontWeight: "700",
    },

    previewAmount: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "800",
    },

    previewAmountMuted: {
        color: "#64748B",
    },

    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 22,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },

    saveBtnDisabled: {
        opacity: 0.7,
    },

    saveBtnText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.2,
    },

    saveBtnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
    },

    cancelBtn: {
        backgroundColor: "#F1F5F9",
        paddingVertical: 16,
        borderRadius: 22,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    cancelBtnText: {
        color: "#64748B",
        fontSize: 15,
        fontWeight: "700",
    },
});
