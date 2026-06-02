import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Animated,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import { changePassword } from "@/src/services/userService";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

const P = {
    bg:          "#F8FAFC",
    surface:     "#FFFFFF",
    border:      "#E2E8F0",
    borderFocus: COLORS.primary,
    inputBg:     "#F8FAFC",
    text:        COLORS.text,
    muted:       "#64748B",
    placeholder: "#94A3B8",
    error:       "#EF4444",
    success:     "#22C55E",
    primary:     COLORS.primary,
};

// Campo de contraseña reutilizable con toggle de visibilidad
function PasswordField({
                           label,
                           value,
                           onChange,
                           placeholder = "••••••••",
                           hint,
                       }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hint?: string;
}) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    return (
        <View style={fieldStyles.wrap}>
            <Text style={fieldStyles.label}>{label}</Text>
            <View style={[fieldStyles.row, focused && fieldStyles.rowFocused]}>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!visible}
                    placeholder={placeholder}
                    placeholderTextColor={P.placeholder}
                    style={fieldStyles.input}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity
                    onPress={() => setVisible(v => !v)}
                    hitSlop={8}
                    style={fieldStyles.eyeBtn}
                >
                    <Ionicons
                        name={visible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={focused ? P.primary : P.placeholder}
                    />
                </TouchableOpacity>
            </View>
            {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
        </View>
    );
}

const fieldStyles = StyleSheet.create({
    wrap: { marginBottom: 4 },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: P.text,
        marginBottom: 8,
        marginLeft: 2,
        letterSpacing: 0.1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: P.inputBg,
        borderWidth: 1.5,
        borderColor: P.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    rowFocused: {
        borderColor: P.primary,
        backgroundColor: "#FFFFFF",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: P.text,
        height: "100%",
    },
    eyeBtn: {
        paddingLeft: 8,
    },
    hint: {
        marginTop: 6,
        marginLeft: 4,
        fontSize: 12,
        color: P.muted,
    },
});

export default function ChangePasswordScreen() {
    const [passwordActual,    setPasswordActual]    = useState("");
    const [nuevaPassword,     setNuevaPassword]     = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const cardY  = useRef(new Animated.Value(18)).current;
    const cardOp = useRef(new Animated.Value(0)).current;
    const btnOp  = useRef(new Animated.Value(0)).current;
    const scaleBtn = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.stagger(70, [
            Animated.parallel([
                Animated.timing(cardY,  { toValue: 0, duration: 380, useNativeDriver: true }),
                Animated.timing(cardOp, { toValue: 1, duration: 380, useNativeDriver: true }),
            ]),
            Animated.timing(btnOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, [btnOp, cardOp, cardY]);

    // Indicador de fortaleza de contraseña
    const strength = (() => {
        if (nuevaPassword.length === 0) return 0;
        let s = 0;
        if (nuevaPassword.length >= 6)  s++;
        if (nuevaPassword.length >= 10) s++;
        if (/[A-Z]/.test(nuevaPassword)) s++;
        if (/[0-9]/.test(nuevaPassword)) s++;
        if (/[^A-Za-z0-9]/.test(nuevaPassword)) s++;
        return Math.min(s, 3); // 1 débil, 2 media, 3 fuerte
    })();

    const strengthLabel = ["", "Débil", "Media", "Fuerte"][strength];
    const strengthColor = ["", P.error, "#F59E0B", P.success][strength];

    const match = confirmarPassword.length > 0 && nuevaPassword === confirmarPassword;
    const noMatch = confirmarPassword.length > 0 && nuevaPassword !== confirmarPassword;

    const handleSave = async () => {
        if (!passwordActual || !nuevaPassword || !confirmarPassword) {
            Alert.alert("Campos incompletos", "Completa todos los campos para continuar."); return;
        }
        if (nuevaPassword.length < 6) {
            Alert.alert("Contraseña muy corta", "Debe tener al menos 6 caracteres."); return;
        }
        if (nuevaPassword !== confirmarPassword) {
            Alert.alert("No coinciden", "Las contraseñas nuevas no son iguales."); return;
        }
        try {
            setLoading(true);
            await changePassword({ passwordActual, nuevaPassword });
            Alert.alert("¡Listo!", "Tu contraseña fue cambiada correctamente.");
            router.replace("/(tabs)/profile" as any);
        } catch (error: any) {
            const msg = typeof error?.response?.data === "string"
                ? error.response.data
                : error?.response?.data?.message || "No se pudo cambiar la contraseña.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const onPressIn  = () => Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleBtn, { toValue: 1, friction: 4, useNativeDriver: true }).start();

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
                    <Text style={styles.eyebrow}>SEGURIDAD</Text>
                    <Text style={styles.title}>Cambiar{"\n"}contraseña</Text>
                </View>
            </View>

            {/* ── CARD ── */}
            <Animated.View style={[styles.card, { opacity: cardOp, transform: [{ translateY: cardY }] }]}>

                {/* Sección: actual */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contraseña actual</Text>
                    <PasswordField
                        label="Ingresa tu contraseña actual"
                        value={passwordActual}
                        onChange={setPasswordActual}
                    />
                </View>

                <View style={styles.divider} />

                {/* Sección: nueva */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nueva contraseña</Text>
                    <PasswordField
                        label="Elige una contraseña segura"
                        value={nuevaPassword}
                        onChange={setNuevaPassword}
                        hint="Mínimo 6 caracteres"
                    />

                    {/* Barra de fortaleza */}
                    {nuevaPassword.length > 0 && (
                        <View style={styles.strengthRow}>
                            {[1, 2, 3].map(i => (
                                <View
                                    key={i}
                                    style={[
                                        styles.strengthBar,
                                        { backgroundColor: strength >= i ? strengthColor : P.border },
                                    ]}
                                />
                            ))}
                            <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                                {strengthLabel}
                            </Text>
                        </View>
                    )}

                    <PasswordField
                        label="Confirmar contraseña"
                        value={confirmarPassword}
                        onChange={setConfirmarPassword}
                    />

                    {/* Feedback de coincidencia */}
                    {match && (
                        <View style={styles.matchRow}>
                            <Ionicons name="checkmark-circle-outline" size={14} color={P.success} />
                            <Text style={[styles.matchText, { color: P.success }]}>Las contraseñas coinciden</Text>
                        </View>
                    )}
                    {noMatch && (
                        <View style={styles.matchRow}>
                            <Ionicons name="close-circle-outline" size={14} color={P.error} />
                            <Text style={[styles.matchText, { color: P.error }]}>No coinciden</Text>
                        </View>
                    )}
                </View>
            </Animated.View>

            {/* ── BOTÓN ── */}
            <Animated.View style={{ opacity: btnOp, transform: [{ scale: scaleBtn }] }}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    disabled={loading}
                    activeOpacity={1}
                >
                    <Text style={styles.saveText}>
                        {loading ? "Guardando..." : "Actualizar contraseña"}
                    </Text>
                    {!loading && <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />}
                </TouchableOpacity>
            </Animated.View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F0F4FF" },
    container: { flex: 1, paddingHorizontal: 22 },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: Platform.OS === "ios" ? 64 : 48,
        marginBottom: 28,
        gap: 16,
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
    title: {
        fontSize: 28, fontWeight: "800", color: P.text,
        letterSpacing: -0.8, lineHeight: 34,
    },

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

    strengthRow: {
        flexDirection: "row", alignItems: "center",
        gap: 6, marginTop: 10, marginBottom: 18,
    },
    strengthBar: { flex: 1, height: 4, borderRadius: 4 },
    strengthLabel: { fontSize: 12, fontWeight: "700", minWidth: 44 },

    matchRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, marginLeft: 2 },
    matchText: { fontSize: 12, fontWeight: "600" },

    saveButton: {
        backgroundColor: P.primary, paddingVertical: 18, borderRadius: 20,
        alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
    },
    saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    saveArrow: { color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "700" },
});
