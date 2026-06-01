import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Animated,
} from "react-native";

import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import { createGroup, updateGroup } from "@/src/services/groupService";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@/src/context/ToastContext";

const GROUP_COLORS = [
    { hex: "#2563EB", label: "Azul" },
    { hex: "#10B981", label: "Verde" },
    { hex: "#F59E0B", label: "Naranja" },
    { hex: "#8B5CF6", label: "Violeta" },
    { hex: "#EC4899", label: "Rosa" },
    { hex: "#EF4444", label: "Rojo" },
    { hex: "#06B6D4", label: "Celeste" },
    { hex: "#84CC16", label: "Lima" },
];

export default function CreateGroupScreen() {
    const params = useLocalSearchParams();
    const { returnTo, mode, groupId } = params;
    const shouldReturnToDashboard = returnTo === "dashboard";
    const isEditing = mode === "edit";
    const initialName = typeof params.name === "string" ? params.name : "";
    const initialDescription = typeof params.description === "string" ? params.description : "";
    const initialColor = typeof params.color === "string" ? params.color : "#2563EB";
    const toast = useToast();

    const [nombre, setNombre] = useState(initialName);
    const [descripcion, setDescripcion] = useState(initialDescription);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [nombreFocused, setNombreFocused] = useState(false);
    const [descFocused, setDescFocused] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const shakeError = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    const handleCreateGroup = async () => {
        if (!nombre.trim()) {
            setErrorMessage("Ingresa un nombre para el grupo");
            shakeError();
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            if (isEditing && groupId) {
                await updateGroup(Number(groupId), { nombre, descripcion, color: selectedColor });
                toast.showToast({
                    type: "success",
                    title: "Grupo actualizado",
                    message: "Los cambios ya estan guardados.",
                });
                router.replace(`/groups/${groupId}` as any);
                return;
            }

            await createGroup({ nombre, descripcion, color: selectedColor });
            toast.showToast({
                type: "success",
                title: "Grupo creado",
                message: "Ahora puedes invitar a tus amigos.",
            });
            router.replace("/groups" as any);
        } catch (error) {
            console.log(error);
            setErrorMessage("No se pudo crear el grupo. Intenta de nuevo.");
            shakeError();
        } finally {
            setLoading(false);
        }
    };

    const initial = nombre.trim().charAt(0)?.toUpperCase() || "G";
    const backTarget = isEditing && groupId
        ? `/groups/${groupId}`
        : shouldReturnToDashboard
            ? "/(tabs)"
            : "/groups";
    const returnToPreviousScreen = () => {
        router.replace(backTarget as any);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ── */}
            <View style={[styles.header, { backgroundColor: selectedColor }]}>
                <View style={styles.deco1} />
                <View style={styles.deco2} />

                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={returnToPreviousScreen}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? "Editar grupo" : "Nuevo grupo"}</Text>
                    <View style={{ width: 42 }} />
                </View>

                {/* Preview del avatar */}
                <View style={styles.avatarPreviewWrapper}>
                    <View style={styles.avatarPreview}>
                        <Text style={[styles.avatarPreviewText, { color: selectedColor }]}>
                            {initial}
                        </Text>
                    </View>
                    <Text style={styles.avatarHint}>Vista previa</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>

                    {/* ── FORMULARIO ── */}
                    <View style={styles.card}>

                        {/* Nombre */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nombre del grupo</Text>
                            <View style={[
                                styles.inputWrapper,
                                nombreFocused && styles.inputFocused,
                                errorMessage && !nombre.trim() && styles.inputError,
                            ]}>
                                <Ionicons name="create-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Ej: Casa compartida"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={nombre}
                                    onChangeText={(t) => { setNombre(t); setErrorMessage(""); }}
                                    onFocus={() => setNombreFocused(true)}
                                    onBlur={() => setNombreFocused(false)}
                                    maxLength={40}
                                />
                                {nombre.length > 0 && (
                                    <Text style={styles.charCount}>{nombre.length}/40</Text>
                                )}
                            </View>
                        </View>

                        {/* Descripción */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Descripción <Text style={styles.optional}>(opcional)</Text></Text>
                            <View style={[
                                styles.inputWrapper,
                                styles.textAreaWrapper,
                                descFocused && styles.inputFocused,
                            ]}>
                                <TextInput
                                    placeholder="Ej: Gastos mensuales del apartamento..."
                                    placeholderTextColor="#CBD5E1"
                                    multiline
                                    numberOfLines={4}
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    style={[styles.input, styles.textArea]}
                                    onFocus={() => setDescFocused(true)}
                                    onBlur={() => setDescFocused(false)}
                                    maxLength={120}
                                />
                            </View>
                        </View>

                        {/* Colores */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Color del grupo</Text>
                            <View style={styles.colorsGrid}>
                                {GROUP_COLORS.map((c) => (
                                    <TouchableOpacity
                                        key={c.hex}
                                        style={[
                                            styles.colorCircle,
                                            { backgroundColor: c.hex },
                                            selectedColor === c.hex && styles.colorSelected,
                                        ]}
                                        onPress={() => setSelectedColor(c.hex)}
                                        activeOpacity={0.8}
                                    >
                                        {selectedColor === c.hex && (
                                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.selectedColorLabel}>
                                {GROUP_COLORS.find(c => c.hex === selectedColor)?.label || ""}
                            </Text>
                        </View>
                    </View>

                    {/* ── TIP ── */}
                    <View style={styles.tipCard}>
                        <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                            {isEditing
                                ? "El nombre y color se actualizaran para todos los miembros del grupo."
                                : "Despues de crear el grupo podras invitar a tus amigos para empezar a dividir gastos."}
                        </Text>
                    </View>

                    {/* ── ERROR ── */}
                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    {/* ── BOTONES ── */}
                    <TouchableOpacity
                        style={[
                            styles.createBtn,
                            { backgroundColor: selectedColor, shadowColor: selectedColor },
                            loading && styles.createBtnDisabled,
                        ]}
                        onPress={handleCreateGroup}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.createBtnContent}>
                                <Text style={styles.createBtnText}>
                                    {isEditing ? "Guardar cambios" : "Crear grupo"}
                                </Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={returnToPreviousScreen}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    /* ── HEADER ── */
    header: {
        paddingTop: 16,
        paddingBottom: 36,
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
        backgroundColor: "rgba(255,255,255,0.08)",
        top: -70,
        right: -50,
    },

    deco2: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(255,255,255,0.06)",
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
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },

    backArrow: {
        fontSize: 20,
        color: "#FFFFFF",
        fontWeight: "600",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
    },

    avatarPreviewWrapper: {
        alignItems: "center",
        zIndex: 2,
    },

    avatarPreview: {
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.95)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 14,
        elevation: 8,
        marginBottom: 10,
    },

    avatarPreviewText: {
        fontSize: 34,
        fontWeight: "800",
    },

    avatarHint: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    /* ── SCROLL ── */
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    /* ── CARD FORM ── */
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 4,
    },

    fieldGroup: {
        marginBottom: 20,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 10,
        letterSpacing: 0.2,
    },

    optional: {
        color: "#94A3B8",
        fontWeight: "500",
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        gap: 10,
    },

    textAreaWrapper: {
        alignItems: "flex-start",
        paddingTop: 12,
        paddingBottom: 8,
    },

    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: "#EFF6FF",
    },

    inputError: {
        borderColor: "#FCA5A5",
        backgroundColor: "#FFF5F5",
    },

    inputIcon: {
        fontSize: 16,
    },

    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: "#1E293B",
        fontWeight: "500",
    },

    textArea: {
        height: 90,
        textAlignVertical: "top",
        paddingTop: 0,
    },

    charCount: {
        fontSize: 11,
        color: "#CBD5E1",
        fontWeight: "600",
    },

    /* Colores */
    colorsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 10,
    },

    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },

    colorSelected: {
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },

    colorCheck: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "800",
    },

    selectedColorLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
        marginTop: 2,
    },

    /* ── TIP ── */
    tipCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EFF6FF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },

    tipIcon: {
        fontSize: 16,
        marginTop: 1,
    },

    tipText: {
        flex: 1,
        color: "#1D4ED8",
        lineHeight: 21,
        fontSize: 13,
        fontWeight: "600",
    },

    /* ── ERROR ── */
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    errorIcon: {
        fontSize: 14,
    },

    errorText: {
        flex: 1,
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "600",
    },

    /* ── BOTONES ── */
    createBtn: {
        paddingVertical: 18,
        borderRadius: 22,
        alignItems: "center",
        marginBottom: 12,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },

    createBtnDisabled: {
        opacity: 0.65,
    },

    createBtnText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.2,
    },

    createBtnContent: {
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
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    cancelBtnText: {
        color: "#64748B",
        fontSize: 15,
        fontWeight: "700",
    },
});
