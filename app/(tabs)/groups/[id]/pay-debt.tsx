import * as Clipboard from "expo-clipboard";
import * as IntentLauncher from "expo-intent-launcher";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    Animated,
    ActivityIndicator,
    Platform,
} from "react-native";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    router,
    useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
    createPayment,
    getPendingPayments,
} from "@/src/services/paymentDebtService";

export default function PayDebtPage() {

    const {
        id,
        deudorId,
        acreedorId,
        monto,
        yapeNumero,
        returnTo,
    } = useLocalSearchParams();

    const [loading, setLoading] = useState(false);
    const [debtLoaded, setDebtLoaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [debtData, setDebtData] = useState({
        grupoId: Number(id),
        deudorId: Number(deudorId),
        acreedorId: Number(acreedorId),
        monto: Number(monto),
        yapeNumero: String(yapeNumero || ""),
        metodosCobro: [] as any[],
    });
    const [selectedMethod, setSelectedMethod] = useState<any>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const amountValue = Number.isFinite(debtData.monto) ? debtData.monto : 0;
    const rawAvailableMethods =
        debtData.metodosCobro.length > 0
            ? debtData.metodosCobro
            : debtData.yapeNumero && debtData.yapeNumero !== "null"
                ? [{
                    tipo: "YAPE",
                    alias: "Yape",
                    numeroTelefono: debtData.yapeNumero,
                    predeterminado: true,
                }]
                : [];
    const availableMethods = normalizeReceiverMethods(rawAvailableMethods);
    const activeMethod =
        selectedMethod
        || availableMethods.find((method: any) => method.predeterminado)
        || availableMethods[0];
    const methodLabel = getMethodLabel(activeMethod);
    const methodTheme = getMethodTheme(activeMethod, !debtLoaded && availableMethods.length === 0);
    const copyValue = getMethodCopyValue(activeMethod);
    const hasPaymentDestination = Boolean(activeMethod && copyValue);

    useEffect(() => {
        const current = {
            grupoId: Number(id),
            deudorId: Number(deudorId),
            acreedorId: Number(acreedorId),
            monto: Number(monto),
            yapeNumero: String(yapeNumero || ""),
            metodosCobro: [] as any[],
        };

        const hasFullParams =
            Number.isFinite(current.grupoId) &&
            Number.isFinite(current.deudorId) &&
            Number.isFinite(current.acreedorId) &&
            Number.isFinite(current.monto);

        const loadDebt = async () => {
            try {
                setDebtLoaded(false);
                const pending = await getPendingPayments();
                const debt = pending.find((item: any) =>
                    Number(item.grupoId) === Number(id)
                    && (!hasFullParams || (
                        Number(item.deudorId) === current.deudorId
                        && Number(item.acreedorId) === current.acreedorId
                    ))
                );

                if (!debt) {
                    if (hasFullParams) setDebtData(current);
                    return;
                }

                setDebtData({
                    grupoId: Number(debt.grupoId),
                    deudorId: Number(debt.deudorId),
                    acreedorId: Number(debt.acreedorId),
                    monto: Number(debt.monto),
                    yapeNumero: String(debt.yapeNumero || ""),
                    metodosCobro: Array.isArray(debt.metodosCobro)
                        ? debt.metodosCobro
                        : [],
                });
                setSelectedMethod(null);
            } catch (error) {
                console.log(error);
                if (hasFullParams) setDebtData(current);
            } finally {
                setDebtLoaded(true);
            }
        };

        loadDebt();
    }, [id, deudorId, acreedorId, monto, yapeNumero]);

    const handleCopyNumber = async () => {
        if (!copyValue) return;
        await Clipboard.setStringAsync(copyValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleCopyAndOpenApp = async () => {
        await handleCopyNumber();

        const appInfo = getExternalPaymentApp(activeMethod);

        if (!appInfo) {
            return;
        }

        if (Platform.OS !== "android") {
            Alert.alert(
                "Numero copiado",
                `Abre ${appInfo.label} manualmente y pega el numero copiado.`
            );
            return;
        }

        try {
            IntentLauncher.openApplication(appInfo.packageName);
        } catch (error) {
            console.log(error);
            Alert.alert(
                "Numero copiado",
                `No pudimos abrir ${appInfo.label} automaticamente. Abre la app manualmente y pega el numero copiado.`
            );
        }
    };

    const pressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
    };

    const pressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
    };

    const backTarget =
        returnTo === "paymentDashboard"
            ? "/payment?returnTo=dashboard"
            : returnTo === "payment"
                ? "/payment"
                : `/groups/${id}`;

    const submitPayment = async () => {
        if (!hasPaymentDestination) {
            Alert.alert(
                "Metodo no disponible",
                "El destinatario todavia no tiene un metodo de cobro configurado."
            );
            return;
        }

        try {
            setLoading(true);
            await createPayment({
                grupoId: debtData.grupoId,
                deudorId: debtData.deudorId,
                acreedorId: debtData.acreedorId,
                monto: amountValue,
                metodoPagoId: null,
                metodoCobroId: activeMethod?.id ?? null,
                metodoTransferencia: activeMethod?.tipo || "YAPE",
            });
            Alert.alert(
                "Pago registrado",
                `La deuda fue marcada como pagada por ${methodLabel} y se notifico al destinatario.`
            );
            router.replace(backTarget as any);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo registrar el pago");
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (loading) return;

        if (!hasPaymentDestination) {
            Alert.alert(
                "Metodo no disponible",
                "Pidele al destinatario que configure Yape, Plin o una cuenta bancaria antes de registrar el pago."
            );
            return;
        }

        if (Platform.OS === "web") {
            await submitPayment();
            return;
        }

        Alert.alert(
            "Confirmar pago",
            `Confirma que ya realizaste el pago de S/ ${amountValue.toFixed(2)} por ${methodLabel}.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Si, ya pague",
                    onPress: submitPayment,
                }
            ]
        );
    };
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={methodTheme.primary} />

            {/* ── HEADER ── */}
            <View style={[styles.header, { backgroundColor: methodTheme.primary }]}>
                <View style={[styles.deco1, { backgroundColor: methodTheme.glow }]} />
                <View style={[styles.deco2, { backgroundColor: methodTheme.glowSoft }]} />

                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.replace(backTarget as any)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmar pago</Text>
                    <View style={{ width: 42 }} />
                </View>

                {/* Monto central */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Total a pagar</Text>
                    <Text style={styles.amount}>S/ {amountValue.toFixed(2)}</Text>
                    <View style={[styles.amountBadge, { backgroundColor: methodTheme.badgeBg }]}>
                        <Ionicons name={getMethodIcon(activeMethod)} size={14} color="#FFFFFF" />
                        <Text style={styles.amountBadgeText}>{methodLabel}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── INFO BANNER ── */}
                <View style={[
                    styles.infoBanner,
                    { backgroundColor: methodTheme.infoBg, borderColor: methodTheme.infoBorder },
                ]}>
                    <Ionicons name="information-circle-outline" size={18} color={methodTheme.infoText} style={styles.infoBannerIcon} />
                    <Text style={styles.infoBannerText}>
                        {hasPaymentDestination
                            ? "El pago sera registrado y notificado al destinatario automaticamente."
                            : "El destinatario necesita configurar Yape, Plin o una cuenta bancaria para recibir pagos."}
                    </Text>
                </View>

                {/* ── CARD YAPE ── */}
                {availableMethods.length > 1 && (
                    <View style={styles.methodSelector}>
                        <View style={styles.methodSelectorHeader}>
                            <View>
                                <Text style={styles.methodSelectorTitle}>Elige como pagarle</Text>
                                <Text style={styles.methodSelectorSub}>
                                    {availableMethods.length} metodos disponibles del destinatario
                                </Text>
                            </View>
                            <Ionicons name="wallet-outline" size={22} color="#2563EB" />
                        </View>
                        {availableMethods.map((method: any, index: number) => {
                            const active =
                                (activeMethod?.id && activeMethod.id === method.id)
                                || (!activeMethod?.id && activeMethod?.tipo === method.tipo && index === 0);
                            const optionTheme = getMethodTheme(method);

                            return (
                                <TouchableOpacity
                                    key={`${method.tipo}-${method.id ?? index}`}
                                    style={[
                                        styles.methodOption,
                                        {
                                            borderColor: active ? optionTheme.primary : "#E2E8F0",
                                            backgroundColor: active ? optionTheme.infoBg : "#FFFFFF",
                                        },
                                    ]}
                                    onPress={() => setSelectedMethod(method)}
                                    activeOpacity={0.82}
                                >
                                    <View style={[
                                        styles.methodOptionIcon,
                                        { backgroundColor: optionTheme.iconBg },
                                    ]}>
                                        <Ionicons name={getMethodIcon(method)} size={18} color={optionTheme.primary} />
                                    </View>
                                    <View style={styles.methodOptionBody}>
                                        <View style={styles.methodOptionTop}>
                                            <Text style={styles.methodOptionText}>
                                                {getMethodLabel(method)}
                                            </Text>
                                            {method.predeterminado && (
                                                <Text style={[
                                                    styles.methodDefaultBadge,
                                                    { color: optionTheme.primary, backgroundColor: optionTheme.buttonSoft },
                                                ]}>
                                                    Principal
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.methodOptionDetail} numberOfLines={1}>
                                            {getMethodPreview(method)}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={active ? "checkmark-circle" : "ellipse-outline"}
                                        size={22}
                                        color={active ? optionTheme.primary : "#CBD5E1"}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={[
                    styles.yapeCard,
                    { borderColor: methodTheme.border, shadowColor: methodTheme.primary },
                ]}>
                    {/* Header de la card */}
                    <View style={styles.yapeCardHeader}>
                        <View style={[styles.yapeIconBox, { backgroundColor: methodTheme.iconBg }]}>
                            <Ionicons name={getMethodIcon(activeMethod)} size={24} color={methodTheme.primary} />
                        </View>
                        <View>
                            <Text style={styles.yapeCardTitle}>{methodLabel}</Text>
                            <Text style={styles.yapeCardSub}>{getMethodDescription(activeMethod)}</Text>
                        </View>
                    </View>

                    {/* Número grande */}
                    <View style={[
                        styles.yapeNumberBox,
                        { backgroundColor: methodTheme.valueBg, borderColor: methodTheme.border },
                    ]}>
                        <Text style={[styles.yapeNumber, { color: methodTheme.valueText }]}>
                            {copyValue
                                ? copyValue
                                : "No configurado"}
                        </Text>
                        {activeMethod?.tipo === "BANCO" && activeMethod?.cci && (
                            <Text style={styles.methodExtra}>CCI: {activeMethod.cci}</Text>
                        )}
                        {activeMethod?.tipo === "BANCO" && activeMethod?.titular && (
                            <Text style={styles.methodExtra}>Titular: {activeMethod.titular}</Text>
                        )}
                    </View>

                    {/* Botón copiar */}
                    <TouchableOpacity
                        style={[
                            styles.copyBtn,
                            { backgroundColor: methodTheme.buttonSoft, borderColor: methodTheme.border },
                            copied && styles.copyBtnSuccess,
                            !copyValue && styles.disabledAction,
                        ]}
                        onPress={handleCopyNumber}
                        activeOpacity={0.8}
                        disabled={!copyValue}
                    >
                        <Text style={[
                            styles.copyBtnText,
                            { color: methodTheme.primary },
                            copied && styles.copyBtnTextSuccess,
                        ]}>
                            {copied ? "Copiado" : getCopyButtonLabel(activeMethod)}
                        </Text>
                    </TouchableOpacity>
                    {getExternalPaymentApp(activeMethod) && (
                        <TouchableOpacity
                            style={[
                                styles.openAppBtn,
                                { backgroundColor: methodTheme.primary },
                                !copyValue && styles.disabledAction,
                            ]}
                            onPress={handleCopyAndOpenApp}
                            activeOpacity={0.86}
                            disabled={!copyValue}
                        >
                            <Ionicons name="open-outline" size={17} color="#FFFFFF" />
                            <Text style={styles.openAppBtnText}>
                                Copiar numero y abrir {getExternalPaymentApp(activeMethod)?.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── PASOS ── */}
                <Text style={styles.sectionLabel}>CÓMO PAGAR</Text>

                {hasPaymentDestination ? (
                    <View style={styles.stepsCard}>
                        {[
                            { n: "1", text: "Copia el dato de cobro del destinatario", icon: "copy-outline" as const },
                            { n: "2", text: `Realiza el pago por ${methodLabel}`, icon: getMethodIcon(activeMethod) },
                            { n: "3", text: "Regresa aqui y confirma el pago", icon: "checkmark-circle-outline" as const },
                        ].map((step, i) => (
                            <View key={i} style={styles.stepRow}>
                                <View style={[styles.stepNumBox, { backgroundColor: methodTheme.iconBg }]}>
                                    <Text style={[styles.stepNum, { color: methodTheme.primary }]}>{step.n}</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Ionicons name={step.icon} size={18} color={methodTheme.primary} />
                                    <Text style={styles.stepText}>{step.text}</Text>
                                </View>
                                {i < 2 && (
                                    <View style={[
                                        styles.stepConnector,
                                        { backgroundColor: methodTheme.border },
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noMethodHelp}>
                        <Ionicons name="alert-circle-outline" size={22} color="#475569" />
                        <Text style={styles.noMethodHelpTitle}>No hay metodo de cobro</Text>
                        <Text style={styles.noMethodHelpText}>
                            Cuando el destinatario agregue un metodo, esta pantalla mostrara las opciones para pagarle.
                        </Text>
                    </View>
                )}

                {/* ── BOTONES ── */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={[
                            styles.payBtn,
                            { backgroundColor: methodTheme.primary, shadowColor: methodTheme.primary },
                            (loading || !hasPaymentDestination) && styles.payBtnDisabled,
                        ]}
                        onPress={handlePay}
                        disabled={loading || !hasPaymentDestination}
                        activeOpacity={0.88}
                        onPressIn={pressIn}
                        onPressOut={pressOut}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.payBtnText}>
                                {hasPaymentDestination
                                    ? `Ya pague por ${methodLabel}`
                                    : "Metodo no disponible"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.replace(backTarget as any)}
                    activeOpacity={0.75}
                >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

function getMethodLabel(method: any) {
    if (!method) return "Sin metodo";
    if (method.tipo === "PLIN") return "Plin";
    if (method.tipo === "BANCO") return method.bancoNombre || "Cuenta bancaria";
    return "Yape";
}

function normalizeReceiverMethods(methods: any[]) {
    const selectedByType = new Map<string, any>();
    const result: any[] = [];

    methods.forEach((method) => {
        if (!method) return;

        const type = String(method.tipo || "").toUpperCase();

        if (type === "YAPE" || type === "PLIN") {
            const current = selectedByType.get(type);
            if (!current || method.predeterminado) {
                selectedByType.set(type, method);
            }
            return;
        }

        result.push(method);
    });

    ["YAPE", "PLIN"].forEach((type) => {
        const method = selectedByType.get(type);
        if (method?.predeterminado) {
            result.unshift(method);
        } else if (method) {
            result.push(method);
        }
    });

    return result.sort((a, b) => Number(Boolean(b.predeterminado)) - Number(Boolean(a.predeterminado)));
}

function getMethodCopyValue(method: any) {
    if (!method) return "";
    if (method.tipo === "BANCO") return method.cuentaNumero || method.cci || "";
    return method.numeroTelefono || "";
}

function getMethodIcon(method: any): keyof typeof Ionicons.glyphMap {
    if (!method) return "card-outline";
    if (method.tipo === "BANCO") return "business-outline";
    return "call-outline";
}

function getMethodDescription(method: any) {
    if (!method) return "Sin datos configurados";
    if (method.tipo === "BANCO") return "Cuenta del destinatario";
    return "Numero del destinatario";
}

function getMethodPreview(method: any) {
    if (!method) return "Sin datos";
    if (method.tipo === "BANCO") {
        const banco = method.bancoNombre || "Cuenta bancaria";
        const cuenta = method.cuentaNumero || method.cci || "Sin cuenta";
        return `${banco} - ${cuenta}`;
    }

    const alias = method.alias || getMethodLabel(method);
    return `${alias} - ${method.numeroTelefono || "Sin numero"}`;
}

function getCopyButtonLabel(method: any) {
    if (method?.tipo === "BANCO") return "Copiar cuenta";
    if (method?.tipo === "PLIN") return "Copiar numero Plin";
    if (method?.tipo === "YAPE") return "Copiar numero Yape";
    return "Copiar numero";
}

function getExternalPaymentApp(method: any) {
    if (method?.tipo === "YAPE") {
        return {
            label: "Yape",
            packageName: "com.bcp.innovacxion.yapeapp",
        };
    }

    if (method?.tipo === "PLIN") {
        return {
            label: "Interbank",
            packageName: "pe.com.interbank.mobilebanking",
        };
    }

    return null;
}

function getMethodTheme(method: any, loading = false) {
    if (loading || !method) {
        return {
            primary: "#334155",
            valueText: "#0F172A",
            valueBg: "#F8FAFC",
            iconBg: "#E2E8F0",
            border: "#CBD5E1",
            buttonSoft: "#F1F5F9",
            infoBg: "#F8FAFC",
            infoBorder: "#CBD5E1",
            infoText: "#475569",
            badgeBg: "rgba(255,255,255,0.18)",
            glow: "rgba(148,163,184,0.18)",
            glowSoft: "rgba(255,255,255,0.10)",
        };
    }

    if (method?.tipo === "PLIN") {
        return {
            primary: "#00A7B5",
            valueText: "#075985",
            valueBg: "#ECFEFF",
            iconBg: "#CFFAFE",
            border: "#67E8F9",
            buttonSoft: "#E0F7FA",
            infoBg: "#ECFEFF",
            infoBorder: "#A5F3FC",
            infoText: "#0E7490",
            badgeBg: "rgba(255,255,255,0.22)",
            glow: "rgba(34,211,238,0.24)",
            glowSoft: "rgba(255,255,255,0.12)",
        };
    }

    if (method?.tipo === "BANCO") {
        return {
            primary: "#1E293B",
            valueText: "#0F172A",
            valueBg: "#F8FAFC",
            iconBg: "#E2E8F0",
            border: "#CBD5E1",
            buttonSoft: "#F1F5F9",
            infoBg: "#F8FAFC",
            infoBorder: "#CBD5E1",
            infoText: "#475569",
            badgeBg: "rgba(255,255,255,0.16)",
            glow: "rgba(148,163,184,0.18)",
            glowSoft: "rgba(255,255,255,0.10)",
        };
    }

    return {
        primary: "#6D28D9",
        valueText: "#581C87",
        valueBg: "#F8F4FF",
        iconBg: "#F3E8FF",
        border: "#E9D5FF",
        buttonSoft: "#F3E8FF",
        infoBg: "#EEF2FF",
        infoBorder: "#C7D2FE",
        infoText: "#4338CA",
        badgeBg: "rgba(255,255,255,0.18)",
        glow: "rgba(255,255,255,0.07)",
        glowSoft: "rgba(255,255,255,0.05)",
    };
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },

    /* ── HEADER ── */
    header: {
        backgroundColor: "#6D28D9",
        paddingTop: 60,
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
        left: 30,
    },

    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
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
        fontWeight: "700",
        color: "rgba(255,255,255,0.9)",
    },

    amountSection: {
        alignItems: "center",
        zIndex: 2,
    },

    amountLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 8,
    },

    amount: {
        fontSize: 52,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -1.5,
        marginBottom: 12,
    },

    amountBadge: {
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    amountBadgeIcon: {
        fontSize: 13,
    },

    amountBadgeText: {
        color: "rgba(255,255,255,0.9)",
        fontWeight: "700",
        fontSize: 13,
    },

    /* ── SCROLL ── */
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    /* ── INFO BANNER ── */
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EEF2FF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },

    infoBannerIcon: {
        fontSize: 16,
        marginTop: 1,
    },

    infoBannerText: {
        flex: 1,
        color: "#475569",
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "600",
    },

    /* ── YAPE CARD ── */
    methodSelector: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#DBEAFE",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
        gap: 10,
    },

    methodSelectorHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    methodSelectorTitle: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "800",
    },

    methodSelectorSub: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 3,
    },

    methodOption: {
        minHeight: 68,
        borderRadius: 18,
        borderWidth: 1.5,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 12,
    },

    methodOptionIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    methodOptionBody: {
        flex: 1,
        minWidth: 0,
    },

    methodOptionTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    methodOptionText: {
        color: "#0F172A",
        fontSize: 14,
        fontWeight: "800",
    },

    methodOptionDetail: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },

    methodDefaultBadge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 10,
        fontWeight: "800",
        overflow: "hidden",
    },

    yapeCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#6D28D9",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: "#EDE9FE",
    },

    yapeCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 20,
    },

    yapeIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#F3E8FF",
        alignItems: "center",
        justifyContent: "center",
    },

    yapeIconText: {
        fontSize: 24,
    },

    yapeCardTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1E293B",
    },

    yapeCardSub: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
        marginTop: 2,
    },

    yapeNumberBox: {
        backgroundColor: "#F8F4FF",
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: "center",
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#E9D5FF",
    },

    yapeNumber: {
        fontSize: 32,
        fontWeight: "800",
        color: "#581C87",
        letterSpacing: 2,
    },

    methodExtra: {
        marginTop: 6,
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },

    copyBtn: {
        backgroundColor: "#F3E8FF",
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDD6FE",
    },

    copyBtnSuccess: {
        backgroundColor: "#DCFCE7",
        borderColor: "#BBF7D0",
    },

    copyBtnText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#6D28D9",
    },

    copyBtnTextSuccess: {
        color: "#16A34A",
    },

    disabledAction: {
        opacity: 0.48,
    },

    openAppBtn: {
        marginTop: 12,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },

    openAppBtnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    /* ── PASOS ── */
    sectionLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#94A3B8",
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },

    stepsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 22,
        marginBottom: 28,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
    },

    noMethodHelp: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 22,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        alignItems: "center",
    },

    noMethodHelpTitle: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "800",
        marginTop: 10,
    },

    noMethodHelpText: {
        color: "#64748B",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 20,
        marginTop: 6,
        textAlign: "center",
    },

    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        position: "relative",
    },

    stepNumBox: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: "#F3E8FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        flexShrink: 0,
    },

    stepNum: {
        fontSize: 14,
        fontWeight: "800",
        color: "#6D28D9",
    },

    stepContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },

    stepEmoji: {
        fontSize: 18,
    },

    stepText: {
        flex: 1,
        fontSize: 14,
        color: "#1E293B",
        fontWeight: "600",
        lineHeight: 20,
    },

    stepConnector: {
        position: "absolute",
        left: 17,
        bottom: -6,
        width: 2,
        height: 12,
        backgroundColor: "#E9D5FF",
        borderRadius: 1,
    },

    /* ── BOTONES ── */
    payBtn: {
        backgroundColor: "#6D28D9",
        paddingVertical: 18,
        borderRadius: 22,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#6D28D9",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },

    payBtnDisabled: {
        opacity: 0.6,
    },

    payBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.2,
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
        fontWeight: "700",
        fontSize: 15,
    },
});



