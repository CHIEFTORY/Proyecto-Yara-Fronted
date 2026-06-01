import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
} from "react-native";

import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import { searchUsers } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import {
    addUserToGroup,
    getGroupUsers,
} from "@/src/services/groupService";
import { getMeRequest } from "@/src/services/authService";

// ─── Design Tokens (light — colores originales conservados) ──────────────────
const PALETTE = {
    bg:           "#F8FAFC",   // fondo original
    surface:      "#FFFFFF",   // tarjetas / inputs
    surfaceHover: "#F1F5F9",   // estado presionado
    border:       "#E2E8F0",   // bordes originales
    borderFocus:  COLORS.primary,
    primary:      "#0F172A",   // texto principal original
    textMuted:    "#64748B",   // texto secundario original
    placeholder:  "#94A3B8",   // placeholder original
    accent:       COLORS.primary,
    avatarBg:     "#EEF2FF",   // fondo avatar original
    success:      "#22C55E",   // dot online / enviado
    white:        "#FFFFFF",
};

// Paleta de avatares basada en la inicial (tonos suaves, light-friendly)
const AVATAR_BG  = ["#EEF2FF", "#FFF1F0", "#F0FDF4", "#FFFBEB", "#F5F3FF"];
const AVATAR_FG  = ["#4F46E5", "#E11D48", "#16A34A", "#D97706", "#7C3AED"];

function getAvatarStyle(name: string) {
    const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_BG.length;
    return { bg: AVATAR_BG[idx], fg: AVATAR_FG[idx] };
}

// ─── Animated User Card ───────────────────────────────────────────────────────
function UserCard({
                      item,
                      index,
                      onAdd,
                      addedIds,
                      memberIds,
                      invitingIds,
                  }: {
    item: any;
    index: number;
    onAdd: (id: number) => void;
    addedIds: Set<number>;
    memberIds: Set<number>;
    invitingIds: Set<number>;
}) {
    const translateY = useRef(new Animated.Value(20)).current;
    const opacity    = useRef(new Animated.Value(0)).current;
    const scaleBtn   = useRef(new Animated.Value(1)).current;
    const isAdded    = addedIds.has(item.id);
    const isMember   = memberIds.has(item.id);
    const isInviting = invitingIds.has(item.id);
    const avatar     = getAvatarStyle(item.nombre ?? "");
    const initial    = item.nombre?.charAt(0)?.toUpperCase() ?? "?";
    const disabled   = isAdded || isMember || isInviting;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0, duration: 320,
                delay: index * 55, useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1, duration: 320,
                delay: index * 55, useNativeDriver: true,
            }),
        ]).start();
    }, [index, opacity, translateY]);

    const onPressIn  = () =>
        Animated.spring(scaleBtn, { toValue: 0.94, useNativeDriver: true }).start();
    const onPressOut = () =>
        Animated.spring(scaleBtn, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    return (
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.userCard}>

                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
                    <Text style={[styles.avatarText, { color: avatar.fg }]}>{initial}</Text>
                    <View style={styles.onlineDot} />
                </View>

                {/* Info */}
                <View style={styles.userInfo}>
                    <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                </View>

                {/* Botón */}
                <Animated.View style={{ transform: [{ scale: scaleBtn }] }}>
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            disabled && styles.addButtonDone,
                            isMember && styles.addButtonMember,
                        ]}
                        onPress={() => !disabled && onAdd(item.id)}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        activeOpacity={1}
                        disabled={disabled}
                    >
                        <Text style={[styles.addButtonText, disabled && styles.addButtonTextDone]}>
                            {isMember ? "Miembro" : isInviting ? "Enviando..." : isAdded ? "Enviado" : "Invitar"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </Animated.View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddMemberScreen() {
    const { id, groupName } = useLocalSearchParams();
    const nombre = Array.isArray(groupName) ? groupName[0] : groupName || "tu grupo";

    const [query,    setQuery]    = useState("");
    const [users,    setUsers]    = useState<any[]>([]);
    const [loading,  setLoading]  = useState(false);
    const [focused,  setFocused]  = useState(false);
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
    const [memberIds, setMemberIds] = useState<Set<number>>(new Set());
    const [invitingIds, setInvitingIds] = useState<Set<number>>(new Set());
    const [canInvite, setCanInvite] = useState(true);
    const [checkingPermission, setCheckingPermission] = useState(true);

    const headerY  = useRef(new Animated.Value(-16)).current;
    const headerOp = useRef(new Animated.Value(0)).current;
    const searchY  = useRef(new Animated.Value(12)).current;
    const searchOp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(70, [
            Animated.parallel([
                Animated.timing(headerY,  { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(searchY,  { toValue: 0, duration: 360, useNativeDriver: true }),
                Animated.timing(searchOp, { toValue: 1, duration: 360, useNativeDriver: true }),
            ]),
        ]).start();
    }, [headerOp, headerY, searchOp, searchY]);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const [members, me] = await Promise.all([
                    getGroupUsers(Number(id)),
                    getMeRequest(),
                ]);
                setMemberIds(new Set(members.map((member: any) => member.id)));
                const currentMember = members.find((member: any) => member.email === me.email);
                setCanInvite(currentMember?.rol?.toUpperCase() === "ADMIN");
            } catch (error) {
                console.log(error);
            } finally {
                setCheckingPermission(false);
            }
        };

        loadMembers();
    }, [id]);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length < 2) { setUsers([]); return; }
        try {
            setLoading(true);
            setUsers(await searchUsers(text));
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (userId: number) => {
        if (memberIds.has(userId) || addedIds.has(userId) || invitingIds.has(userId)) return;
        if (!canInvite) {
            Alert.alert("Sin permisos", "Solo un administrador puede invitar personas.");
            return;
        }

        try {
            setInvitingIds(prev => new Set([...prev, userId]));
            await addUserToGroup(Number(id), userId);
            setAddedIds(prev => new Set([...prev, userId]));
            Alert.alert(
                "Invitación enviada",
                "El usuario deberá aceptar la solicitud para unirse al grupo."
            );
        } catch (e: any) {
            console.log(e);
            const message =
                e?.response?.data?.message ||
                e?.response?.data ||
                "No se pudo enviar la invitación. Intenta de nuevo.";

            if (String(message).toLowerCase().includes("pendiente")) {
                setAddedIds(prev => new Set([...prev, userId]));
            }

            if (String(message).toLowerCase().includes("pertenece")) {
                setMemberIds(prev => new Set([...prev, userId]));
            }

            Alert.alert("No se pudo invitar", String(message));
        } finally {
            setInvitingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const showHint  = !loading && query.length < 2;
    const showEmpty = !loading && query.length >= 2 && users.length === 0;

    return (
        <View style={styles.container}>

            {/* Decoración sutil de fondo */}
            <View style={styles.bgBlob1} />
            <View style={styles.bgBlob2} />

            {/* ── HEADER ── */}
            <Animated.View
                style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace(`/groups/${id}` as any)}
                    activeOpacity={0.75}
                >
                    <Ionicons name="chevron-back" size={22} color={PALETTE.primary} />
                </TouchableOpacity>

                <View style={styles.headerText}>
                    <Text style={styles.eyebrow}>GRUPO</Text>
                    <Text style={styles.title}>Invitar a{"\n"}{nombre}</Text>
                    <Text style={styles.subtitle}>Agrega personas a este grupo</Text>
                </View>
            </Animated.View>

            {/* ── SEARCH ── */}
            <Animated.View
                style={[
                    styles.searchWrapper,
                    focused && styles.searchWrapperFocused,
                    { opacity: searchOp, transform: [{ translateY: searchY }] },
                ]}
            >
                <Ionicons name="search-outline" size={19} color={PALETTE.placeholder} />
                <TextInput
                    placeholder="Buscar usuario..."
                    placeholderTextColor={PALETTE.placeholder}
                    style={styles.input}
                    value={query}
                    onChangeText={handleSearch}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch("")} hitSlop={10}>
                        <Ionicons name="close" size={18} color={PALETTE.textMuted} />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* ── LOADING ── */}
            {loading && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator color={COLORS.primary} size="small" />
                    <Text style={styles.loadingText}>Buscando...</Text>
                </View>
            )}

            {!checkingPermission && !canInvite && (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="lock-closed-outline" size={38} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Solo administradores</Text>
                    <Text style={styles.emptySubtitle}>
                        Puedes ver el grupo, pero no invitar personas.
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={() => router.replace(`/groups/${id}` as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.permissionButtonText}>Volver al grupo</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── HINT ── */}
            {canInvite && showHint && (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="people-outline" size={38} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Busca usuarios</Text>
                    <Text style={styles.emptySubtitle}>
                        Escribe un nombre o correo{"\n"}para comenzar
                    </Text>
                </View>
            )}

            {/* ── SIN RESULTADOS ── */}
            {canInvite && showEmpty && (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="search-outline" size={38} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptySubtitle}>
                        No encontramos usuarios con{"\n"}{`"${query}"`}
                    </Text>
                </View>
            )}

            {/* ── LISTA ── */}
            {canInvite && !showHint && (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        users.length > 0 ? (
                            <Text style={styles.resultCount}>
                                {users.length} resultado{users.length !== 1 ? "s" : ""}
                            </Text>
                        ) : null
                    }
                    renderItem={({ item, index }) => (
                        <UserCard
                            item={item}
                            index={index}
                            onAdd={handleAddUser}
                            addedIds={addedIds}
                            memberIds={memberIds}
                            invitingIds={invitingIds}
                        />
                    )}
                />
            )}

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: PALETTE.bg,
        paddingHorizontal: 20,
    },

    // Decoración de fondo muy sutil (tonos del palette original)
    bgBlob1: {
        position: "absolute",
        top: -100,
        right: -60,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "#EEF2FF",
        opacity: 0.6,
    },
    bgBlob2: {
        position: "absolute",
        bottom: 80,
        left: -80,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "#F1F5F9",
        opacity: 0.8,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: Platform.OS === "ios" ? 64 : 48,
        marginBottom: 28,
        gap: 14,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: PALETTE.surface,
        borderWidth: 1,
        borderColor: PALETTE.border,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
    },

    backArrow: {
        fontSize: 20,
        color: PALETTE.primary,
        fontWeight: "600",
    },

    headerText: {
        flex: 1,
    },

    eyebrow: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2.4,
        color: COLORS.primary,
        opacity: 0.45,
        marginBottom: 2,
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: PALETTE.primary,
        letterSpacing: -0.8,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: PALETTE.textMuted,
    },

    // ── Search ──────────────────────────────────────────────────────────────
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: PALETTE.surface,
        height: 56,
        borderRadius: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: PALETTE.border,
        gap: 10,
        marginBottom: 6,
    },

    searchWrapperFocused: {
        borderColor: PALETTE.primary,
        borderWidth: 1.5,
    },

    searchIcon: {
        fontSize: 16,
    },

    input: {
        flex: 1,
        color: PALETTE.primary,
        fontSize: 15,
        fontWeight: "500",
        height: "100%",
    },

    clearBtn: {
        color: PALETTE.placeholder,
        fontSize: 13,
        fontWeight: "700",
        paddingHorizontal: 4,
    },

    // ── Loading ──────────────────────────────────────────────────────────────
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 28,
    },

    loadingText: {
        color: PALETTE.textMuted,
        fontSize: 14,
    },

    // ── Empty states ─────────────────────────────────────────────────────────
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 60,
    },

    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: PALETTE.surface,
        borderWidth: 1,
        borderColor: PALETTE.border,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    emptyEmoji: {
        fontSize: 32,
    },

    emptyTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: PALETTE.primary,
        marginBottom: 8,
    },

    emptySubtitle: {
        color: PALETTE.textMuted,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
    },

    permissionButton: {
        marginTop: 18,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },

    permissionButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    // ── List ─────────────────────────────────────────────────────────────────
    listContent: {
        paddingTop: 16,
        paddingBottom: 48,
    },

    resultCount: {
        fontSize: 12,
        fontWeight: "600",
        color: PALETTE.textMuted,
        letterSpacing: 0.4,
        marginBottom: 10,
        marginLeft: 2,
    },

    // ── User Card ────────────────────────────────────────────────────────────
    cardWrap: {
        marginBottom: 10,
    },

    userCard: {
        backgroundColor: PALETTE.surface,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEF2F7",
        gap: 12,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
    },

    avatarText: {
        fontSize: 18,
        fontWeight: "800",
    },

    onlineDot: {
        position: "absolute",
        bottom: 1,
        right: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PALETTE.success,
        borderWidth: 2,
        borderColor: PALETTE.surface,
    },

    userInfo: {
        flex: 1,
    },

    name: {
        fontSize: 15,
        fontWeight: "700",
        color: PALETTE.primary,
        letterSpacing: -0.2,
    },

    email: {
        marginTop: 3,
        color: PALETTE.textMuted,
        fontSize: 12,
        fontWeight: "500",
    },

    // ── Add Button ───────────────────────────────────────────────────────────
    addButton: {
        backgroundColor: PALETTE.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexShrink: 0,
    },

    addButtonDone: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: PALETTE.success,
    },

    addButtonMember: {
        borderColor: PALETTE.border,
        backgroundColor: PALETTE.surfaceHover,
    },

    addButtonText: {
        color: PALETTE.white,
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.1,
    },

    addButtonTextDone: {
        color: PALETTE.success,
    },
});
