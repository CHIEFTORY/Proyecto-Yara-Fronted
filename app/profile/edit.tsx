import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Animated,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import { getProfile, updateProfile } from "@/src/services/userService";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

const P = {
    bg:          "#F8FAFC",
    surface:     "#FFFFFF",
    border:      "#E2E8F0",
    inputBg:     "#F8FAFC",
    disabledBg:  "#F1F5F9",
    disabledText:"#94A3B8",
    text:        COLORS.text,
    muted:       "#64748B",
    placeholder: "#94A3B8",
    primary:     COLORS.primary,
};

// Campo genérico reutilizable
function Field({
                   label,
                   value,
                   onChange,
                   placeholder,
                   keyboardType = "default",
                   disabled = false,
                   icon,
                   note,
               }: {
    label: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    keyboardType?: any;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    note?: string;
}) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={fStyles.wrap}>
            <Text style={fStyles.label}>{label}</Text>
            <View style={[
                fStyles.row,
                focused && !disabled && fStyles.rowFocused,
                disabled && fStyles.rowDisabled,
            ]}>
                {icon ? <Ionicons name={icon} size={18} color={P.placeholder} style={fStyles.icon} /> : null}
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={P.placeholder}
                    keyboardType={keyboardType}
                    editable={!disabled}
                    style={[fStyles.input, disabled && fStyles.inputDisabled]}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCorrect={false}
                    autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
                />
                {disabled && (
                    <View style={fStyles.lockWrap}>
                        <Ionicons name="lock-closed-outline" size={14} color={P.disabledText} />
                    </View>
                )}
            </View>
            {note ? <Text style={fStyles.note}>{note}</Text> : null}
        </View>
    );
}

const fStyles = StyleSheet.create({
    wrap: { marginBottom: 4 },
    label: {
        fontSize: 13, fontWeight: "700", color: P.text,
        marginBottom: 8, marginLeft: 2,
    },
    row: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: P.inputBg, borderWidth: 1.5,
        borderColor: P.border, borderRadius: 16,
        paddingHorizontal: 14, height: 56, gap: 8,
    },
    rowFocused: { borderColor: P.primary, backgroundColor: P.surface },
    rowDisabled: { backgroundColor: P.disabledBg, borderColor: "#E2E8F0" },
    icon: { fontSize: 16 },
    input: { flex: 1, fontSize: 15, color: P.text, height: "100%" },
    inputDisabled: { color: P.disabledText },
    lockWrap: {
        width: 26, height: 26, borderRadius: 8,
        backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center",
    },
    note: {
        marginTop: 6, marginLeft: 4,
        fontSize: 12, color: P.muted,
    },
});

export default function EditProfileScreen() {
    const [nombre,   setNombre]   = useState("");
    const [telefono, setTelefono] = useState("");
    const [email,    setEmail]    = useState("");
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);

    const cardY  = useRef(new Animated.Value(18)).current;
    const cardOp = useRef(new Animated.Value(0)).current;
    const btnOp  = useRef(new Animated.Value(0)).current;
    const scaleBtn = useRef(new Animated.Value(1)).current;

    const loadProfile = useCallback(async () => {
        try {
            const data = await getProfile();
            setNombre(data.nombre || "");
            setTelefono(data.telefono || "");
            setEmail(data.email || "");
        } catch {
            Alert.alert("Error", "No se pudo cargar el perfil.");
        } finally {
            setLoading(false);
            Animated.stagger(70, [
                Animated.parallel([
                    Animated.timing(cardY,  { toValue: 0, duration: 380, useNativeDriver: true }),
                    Animated.timing(cardOp, { toValue: 1, duration: 380, useNativeDriver: true }),
                ]),
                Animated.timing(btnOp, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [btnOp, cardOp, cardY]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSave = async () => {
        if (!nombre.trim())   { Alert.alert("Campo requerido", "El nombre es obligatorio."); return; }
        if (!telefono.trim()) { Alert.alert("Campo requerido", "El teléfono es obligatorio."); return; }
        try {
            setSaving(true);
            await updateProfile({ nombre, telefono });
            Alert.alert("¡Listo!", "Tus datos fueron actualizados correctamente.");
            router.replace("/(tabs)/profile" as any);
        } catch {
            Alert.alert("Error", "No se pudo actualizar el perfil.");
        } finally {
            setSaving(false);
        }
    };

    const onPressIn  = () => Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleBtn, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    // Avatar con inicial
    const initial = nombre?.charAt(0)?.toUpperCase() || "?";

    if (loading) {
        return (
            <View style={styles.root}>
                <AmbientScreenBackground />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={P.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <AmbientScreenBackground />
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/(tabs)/profile" as any)}
                    activeOpacity={0.75}
                >
                    <Ionicons name="chevron-back" size={22} color={P.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.eyebrow}>CUENTA</Text>
                    <Text style={styles.title}>Editar perfil</Text>
                </View>
            </View>

            {/* ── AVATAR ── */}
            <Animated.View style={[styles.avatarSection, { opacity: cardOp }]}>
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    {/* Badge de edición */}
                    <View style={styles.avatarBadge}>
                        <Ionicons name="pencil" size={11} color="#FFFFFF" />
                    </View>
                </View>
                <Text style={styles.avatarName}>{nombre || "Tu nombre"}</Text>
                <Text style={styles.avatarEmail}>{email}</Text>
            </Animated.View>

            {/* ── CARD ── */}
            <Animated.View style={[styles.card, { opacity: cardOp, transform: [{ translateY: cardY }] }]}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información personal</Text>
                    <Field
                        label="Nombre completo"
                        value={nombre}
                        onChange={setNombre}
                        placeholder="Tu nombre"
                        icon="person-outline"
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    <Field
                        label="Correo electrónico"
                        value={email}
                        disabled
                        icon="mail-outline"
                        note="El correo no se puede modificar"
                    />
                    <View style={{ height: 14 }} />
                    <Field
                        label="Teléfono"
                        value={telefono}
                        onChange={setTelefono}
                        placeholder="999 999 999"
                        keyboardType="phone-pad"
                        icon="phone-portrait-outline"
                    />
                </View>
            </Animated.View>

            {/* ── BOTÓN ── */}
            <Animated.View style={{ opacity: btnOp, transform: [{ scale: scaleBtn }] }}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    disabled={saving}
                    activeOpacity={1}
                >
                    <Text style={styles.saveText}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </Text>
                    {!saving && <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />}
                </TouchableOpacity>
            </Animated.View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F0F4FF" },
    container: { flex: 1, paddingHorizontal: 22 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        flexDirection: "row", alignItems: "flex-start",
        marginTop: Platform.OS === "ios" ? 64 : 48,
        marginBottom: 24, gap: 16,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: P.surface, borderWidth: 1, borderColor: P.border,
        justifyContent: "center", alignItems: "center", marginTop: 4,
    },
    eyebrow: {
        fontSize: 11, fontWeight: "700", letterSpacing: 2.2,
        color: P.primary, opacity: 0.5, marginBottom: 2,
    },
    title: { fontSize: 28, fontWeight: "800", color: P.text, letterSpacing: -0.8 },

    // Avatar
    avatarSection: { alignItems: "center", marginBottom: 28 },
    avatarWrap: { position: "relative", marginBottom: 10 },
    avatar: {
        width: 80, height: 80, borderRadius: 26,
        backgroundColor: "#EEF2FF",
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "#E0E7FF",
    },
    avatarText: { fontSize: 32, fontWeight: "800", color: P.primary },
    avatarBadge: {
        position: "absolute", bottom: -4, right: -4,
        width: 26, height: 26, borderRadius: 8,
        backgroundColor: P.primary, justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: P.bg,
    },
    avatarName: { fontSize: 17, fontWeight: "800", color: P.text, letterSpacing: -0.3 },
    avatarEmail: { marginTop: 2, fontSize: 13, color: P.muted },

    card: {
        backgroundColor: P.surface, borderRadius: 26,
        borderWidth: 1, borderColor: "#EEF2F7",
        overflow: "hidden", marginBottom: 20,
    },
    section: { padding: 20 },
    sectionTitle: {
        fontSize: 12, fontWeight: "700", letterSpacing: 1.2,
        color: P.muted, marginBottom: 16, textTransform: "uppercase",
    },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 20 },

    saveButton: {
        backgroundColor: P.primary, paddingVertical: 18, borderRadius: 20,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    saveArrow: { color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "700" },
});
