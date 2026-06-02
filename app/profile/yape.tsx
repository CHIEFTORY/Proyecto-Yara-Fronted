import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";
import {
    createCollectionMethod,
    deleteCollectionMethod,
    getCollectionMethods,
    MetodoCobro,
    MetodoCobroTipo,
    setDefaultCollectionMethod,
    updateCollectionMethod,
} from "@/src/services/userService";

// ─── Constantes ────────────────────────────────────────────────────────────────

const METHOD_OPTIONS: {
    tipo: MetodoCobroTipo;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}[] = [
    { tipo: "YAPE", label: "Yape", icon: "call-outline" },
    { tipo: "PLIN", label: "Plin", icon: "call-outline" },
    { tipo: "BANCO", label: "Banco", icon: "business-outline" },
];

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function CollectionMethodsScreen() {
    const { returnTo } = useLocalSearchParams();
    const [methods, setMethods] = useState<MetodoCobro[]>([]);
    const [selectedType, setSelectedType] = useState<MetodoCobroTipo>("YAPE");
    const [phone, setPhone] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [cci, setCci] = useState("");
    const [holder, setHolder] = useState("");
    const [editingMethod, setEditingMethod] = useState<MetodoCobro | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const hasMethods = methods.length > 0;
    const backTarget = returnTo === "dashboard" ? "/(tabs)" : "/(tabs)/profile";
    const returnToPreviousScreen = () => {
        if (returnTo === "dashboard" && router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(backTarget as any);
    };

    const currentTypeLabel = useMemo(
        () => METHOD_OPTIONS.find((item) => item.tipo === selectedType)?.label || "Metodo",
        [selectedType]
    );
    const isSingleMethodTypeTaken = useCallback((tipo: MetodoCobroTipo) =>
        tipo !== "BANCO"
        && methods.some((method) =>
            method.tipo === tipo
            && method.id !== editingMethod?.id
        ), [editingMethod?.id, methods]);

    useEffect(() => {
        if (editingMethod || !isSingleMethodTypeTaken(selectedType)) return;

        const nextType = METHOD_OPTIONS.find((option) =>
            !isSingleMethodTypeTaken(option.tipo)
        )?.tipo || "BANCO";

        setSelectedType(nextType);
    }, [editingMethod, isSingleMethodTypeTaken, selectedType]);

    useEffect(() => { loadMethods(); }, []);

    const loadMethods = async () => {
        try {
            setLoading(true);
            setMethods(await getCollectionMethods());
        } catch {
            Alert.alert("Error", "No se pudieron cargar tus metodos de cobro.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPhone(""); setBankName(""); setAccountNumber(""); setCci(""); setHolder("");
        setEditingMethod(null);
        setSelectedType("YAPE");
    };

    const startEdit = (method: MetodoCobro) => {
        if (!method.id) {
            Alert.alert("Dato anterior", "Agrega un nuevo metodo para reemplazar este dato antiguo.");
            return;
        }

        setEditingMethod(method);
        setSelectedType(method.tipo);
        setPhone(method.numeroTelefono || "");
        setBankName(method.bancoNombre || "");
        setAccountNumber(method.cuentaNumero || "");
        setCci(method.cci || "");
        setHolder(method.titular || "");
    };

    const handleSave = async () => {
        if (saving) return;
        const cleanedPhone = phone.replace(/\D/g, "");

        if (isSingleMethodTypeTaken(selectedType)) {
            Alert.alert(
                "Metodo ya registrado",
                `Solo puedes tener un ${currentTypeLabel} activo. Edita el existente o eliminalo para agregar otro.`
            );
            return;
        }

        const payload =
            selectedType === "BANCO"
                ? { tipo: selectedType, alias: "Cuenta bancaria", bancoNombre: bankName.trim(), cuentaNumero: accountNumber.trim(), cci: cci.trim(), titular: holder.trim(), predeterminado: !hasMethods }
                : { tipo: selectedType, alias: currentTypeLabel, numeroTelefono: cleanedPhone, predeterminado: !hasMethods };

        if (selectedType !== "BANCO" && cleanedPhone.length !== 9) {
            Alert.alert("Numero invalido", "Ingresa un numero de 9 digitos."); return;
        }
        if (selectedType === "BANCO" && !bankName.trim()) {
            Alert.alert("Banco requerido", "Ingresa el nombre del banco."); return;
        }
        if (selectedType === "BANCO" && !accountNumber.trim() && !cci.trim()) {
            Alert.alert("Cuenta requerida", "Ingresa una cuenta o CCI."); return;
        }
        try {
            setSaving(true);
            if (editingMethod?.id) {
                await updateCollectionMethod(editingMethod.id, {
                    ...payload,
                    predeterminado: editingMethod.predeterminado,
                });
            } else {
                await createCollectionMethod(payload);
            }
            resetForm();
            await loadMethods();
            Alert.alert(
                "Listo",
                editingMethod
                    ? `${currentTypeLabel} fue actualizado correctamente.`
                    : `${currentTypeLabel} fue agregado correctamente.`
            );
        } catch (error: any) {
            Alert.alert(
                "No se pudo guardar",
                error.response?.data?.message
                || error.response?.data
                || "Revisa los datos e intenta de nuevo."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDefault = async (method: MetodoCobro) => {
        if (!method.id || method.predeterminado) return;
        try {
            await setDefaultCollectionMethod(method.id);
            await loadMethods();
        } catch {
            Alert.alert("Error", "No se pudo marcar como predeterminado.");
        }
    };

    const handleDelete = async (method: MetodoCobro) => {
        if (!method.id) {
            Alert.alert("Yape anterior", "Agrega un nuevo metodo para reemplazar este dato antiguo."); return;
        }
        const remove = async () => {
            try {
                await deleteCollectionMethod(method.id as number);
                await loadMethods();
            } catch {
                Alert.alert("Error", "No se pudo eliminar el metodo.");
            }
        };
        if (Platform.OS === "web") { await remove(); return; }
        Alert.alert("Eliminar metodo", "Este metodo ya no aparecera cuando alguien quiera pagarte.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: remove },
        ]);
    };

    const renderMethodValue = (method: MetodoCobro) => {
        if (method.tipo === "BANCO") {
            return [method.bancoNombre, method.cuentaNumero && `Cuenta ${method.cuentaNumero}`, method.cci && `CCI ${method.cci}`]
                .filter(Boolean).join(" · ");
        }
        return method.numeroTelefono || "Sin numero";
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <AmbientScreenBackground />

            {/* ── Header (sin expo-linear-gradient) ── */}
            <View style={styles.headerGradient}>
                <View style={styles.orb1} />
                <View style={styles.orb2} />

                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={returnToPreviousScreen}>
                        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Metodos de cobro</Text>
                    <View style={styles.headerGhost} />
                </View>

                <View style={styles.heroCopy}>
                    <Text style={styles.heroEyebrow}>CONFIGURACION</Text>
                    <Text style={styles.heroHeading}>¿Donde recibes{"\n"}tus pagos?</Text>
                    <Text style={styles.heroSub}>
                        Tus amigos veran estos datos solo cuando tengan una deuda contigo.
                    </Text>
                </View>
            </View>

            {/* ── Contenido ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SectionLabel>Metodos guardados</SectionLabel>

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={styles.loader} />
                ) : methods.length === 0 ? (
                    <EmptyState />
                ) : (
                    <View style={styles.methodsList}>
                        {methods.map((method, index) => (
                            <MethodCard
                                key={`${method.tipo}-${method.id ?? index}`}
                                method={method}
                                renderValue={renderMethodValue}
                                onDefault={() => handleDefault(method)}
                                onEdit={() => startEdit(method)}
                                onDelete={() => handleDelete(method)}
                            />
                        ))}
                    </View>
                )}

                <Divider />

                <SectionLabel style={styles.sectionLabelSpaced}>
                    {editingMethod ? "Editar metodo" : "Agregar metodo"}
                </SectionLabel>

                <View style={styles.segmented}>
                    {METHOD_OPTIONS.map((opt) => {
                        const active = opt.tipo === selectedType;
                        const disabled = isSingleMethodTypeTaken(opt.tipo);
                        return (
                            <TouchableOpacity
                                key={opt.tipo}
                                style={[
                                    styles.segment,
                                    active && styles.segmentActive,
                                    disabled && styles.segmentDisabled,
                                ]}
                                onPress={() => {
                                    if (disabled) {
                                        Alert.alert(
                                            "Metodo ya registrado",
                                            `Ya tienes un ${opt.label} activo. Puedes editarlo o eliminarlo si quieres cambiarlo.`
                                        );
                                        return;
                                    }
                                    setSelectedType(opt.tipo);
                                    setPhone("");
                                    setBankName("");
                                    setAccountNumber("");
                                    setCci("");
                                    setHolder("");
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={opt.icon} size={15} color={active ? "#FFFFFF" : "#64748B"} />
                                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.formCard}>
                    {selectedType === "BANCO" ? (
                        <>
                            <PremiumInput label="Banco" value={bankName} onChangeText={setBankName} placeholder="BCP, Interbank, BBVA..." />
                            <PremiumInput label="Numero de cuenta" value={accountNumber} onChangeText={setAccountNumber} placeholder="Cuenta soles" keyboardType="number-pad" />
                            <PremiumInput label="CCI" optional value={cci} onChangeText={setCci} placeholder="20 digitos" keyboardType="number-pad" />
                            <PremiumInput label="Titular" value={holder} onChangeText={setHolder} placeholder="Nombre completo" />
                        </>
                    ) : (
                        <PremiumInput
                            label={`Numero ${currentTypeLabel}`}
                            value={phone}
                            onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 9))}
                            placeholder="999 888 777"
                            keyboardType="phone-pad"
                            maxLength={9}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.85}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                <Text style={styles.saveBtnText}>
                                    {editingMethod ? "Actualizar metodo" : "Guardar metodo"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {editingMethod && (
                        <TouchableOpacity
                            style={styles.cancelEditBtn}
                            onPress={resetForm}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelEditText}>Cancelar edicion</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────────

function SectionLabel({ children, style }: { children: string; style?: object }) {
    return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

function Divider() {
    return <View style={styles.divider} />;
}

function EmptyState() {
    return (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
                <Ionicons name="wallet-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>Sin metodos guardados</Text>
            <Text style={styles.emptyText}>
                Agrega Yape, Plin o una cuenta bancaria para que puedan pagarte.
            </Text>
        </View>
    );
}

function MethodCard({
                        method,
                        renderValue,
                        onDefault,
                        onEdit,
                        onDelete,
                    }: {
    method: MetodoCobro;
    renderValue: (m: MetodoCobro) => string;
    onDefault: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <View style={styles.methodCard}>
            <View style={styles.methodIconWrap}>
                <Ionicons
                    name={method.tipo === "BANCO" ? "business-outline" : "call-outline"}
                    size={20}
                    color="#2563EB"
                />
            </View>
            <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                    <Text style={styles.methodName}>{method.alias || methodLabel(method.tipo)}</Text>
                    {method.predeterminado && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Principal</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.methodValue} numberOfLines={1}>{renderValue(method)}</Text>
                {method.titular ? (
                    <Text style={styles.methodOwner}>Titular: {method.titular}</Text>
                ) : null}
            </View>
            <View style={styles.methodActions}>
                {!method.predeterminado && !!method.id && (
                    <TouchableOpacity style={styles.actionBtn} onPress={onDefault}>
                        <Ionicons name="star-outline" size={15} color="#D97706" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                    <Ionicons name="create-outline" size={15} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={15} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function PremiumInput({
                          label,
                          optional,
                          value,
                          onChangeText,
                          placeholder,
                          keyboardType = "default",
                          maxLength,
                      }: {
    label: string;
    optional?: boolean;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    keyboardType?: "default" | "number-pad" | "phone-pad";
    maxLength?: number;
}) {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>{label}</Text>
                {optional && <Text style={styles.inputOptional}>Opcional</Text>}
            </View>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );
}

function methodLabel(tipo: MetodoCobroTipo) {
    if (tipo === "PLIN") return "Plin";
    if (tipo === "BANCO") return "Cuenta bancaria";
    return "Yape";
}

// ─── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F7F6F3",
    },

    // ── Header (color sólido, sin dependencia externa) ──
    headerGradient: {
        backgroundColor: "#1E40AF",   // azul profundo único
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 12 : 28,
        paddingBottom: 28,
        overflow: "hidden",
    },
    orb1: {
        position: "absolute",
        top: -50,
        right: -30,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.07)",
    },
    orb2: {
        position: "absolute",
        bottom: -40,
        left: -20,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
        zIndex: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerGhost: { width: 40 },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    heroCopy: { zIndex: 1 },
    heroEyebrow: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 2,
        marginBottom: 6,
    },
    heroHeading: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: -0.6,
        lineHeight: 30,
        marginBottom: 10,
    },
    heroSub: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "400",
    },

    // ── Scroll ──
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 40 },

    // ── Secciones ──
    sectionLabel: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 2,
        color: "#94A3B8",
        textTransform: "uppercase",
        marginBottom: 12,
        paddingLeft: 2,
    },
    sectionLabelSpaced: { marginTop: 22 },

    divider: {
        height: 1,
        backgroundColor: "#E8E6E0",
        marginVertical: 22,
    },

    loader: { marginVertical: 24 },

    // ── Empty ──
    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#E2E0D9",
        borderStyle: "dashed",
        padding: 28,
        alignItems: "center",
    },
    emptyIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 6,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 19,
    },

    // ── Methods list ──
    methodsList: { gap: 8 },
    methodCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ECEAE4",
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    methodIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
    },
    methodInfo: { flex: 1, minWidth: 0 },
    methodTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 3,
        flexWrap: "wrap",
    },
    methodName: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    badge: {
        backgroundColor: "#DCFCE7",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: { color: "#15803D", fontSize: 10, fontWeight: "800" },
    methodValue: { color: "#475569", fontSize: 12, fontWeight: "400" },
    methodOwner: { color: "#94A3B8", fontSize: 11, marginTop: 2 },
    methodActions: { flexDirection: "row", gap: 6 },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#FAFAF8",
        borderWidth: 1,
        borderColor: "#ECEAE4",
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtnDanger: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
    },

    // ── Segmented ──
    segmented: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ECEAE4",
        padding: 4,
        marginBottom: 14,
        gap: 3,
    },
    segment: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    segmentActive: {
        backgroundColor: "#2563EB",
        shadowColor: "#2563EB",
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    segmentDisabled: {
        opacity: 0.42,
    },
    segmentText: { color: "#64748B", fontSize: 13, fontWeight: "600" },
    segmentTextActive: { color: "#FFFFFF" },

    // ── Form ──
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ECEAE4",
        padding: 18,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    inputGroup: { marginBottom: 14 },
    inputLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 7,
    },
    inputLabel: { color: "#334155", fontSize: 12, fontWeight: "700" },
    inputOptional: { color: "#94A3B8", fontSize: 11, fontWeight: "400" },
    input: {
        height: 50,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: "#E2E0D9",
        backgroundColor: "#FAFAF8",
        paddingHorizontal: 14,
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "500",
    },

    // ── Save button ──
    saveBtn: {
        height: 54,
        borderRadius: 15,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 6,
        shadowColor: "#2563EB",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    saveBtnDisabled: { opacity: 0.55 },
    saveBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: -0.2,
    },

    cancelEditBtn: {
        height: 46,
        borderRadius: 14,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },

    cancelEditText: {
        color: "#475569",
        fontSize: 13,
        fontWeight: "800",
    },
});
