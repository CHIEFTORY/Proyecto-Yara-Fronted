import {
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/src/styles/colors";
import AmbientScreenBackground from "@/components/ui/AmbientScreenBackground";

const FAQS = [
    {
        title: "Como se calculan las deudas",
        body: "Yara cruza los gastos del grupo, lo que cada persona debe y los pagos confirmados para mostrar el menor numero de pagos posibles.",
        icon: "calculator-outline",
    },
    {
        title: "Por que un pago queda pendiente",
        body: "Los pagos por Yape, Plin o banco necesitan confirmacion del destinatario. Cuando lo acepta, la deuda se descuenta del balance.",
        icon: "time-outline",
    },
    {
        title: "No aparece mi metodo de cobro",
        body: "Agrega tus datos desde Metodos de cobro. Los demas solo los veran cuando tengan una deuda contigo.",
        icon: "wallet-outline",
    },
    {
        title: "Invite a alguien y no aparece",
        body: "La persona debe aceptar la solicitud. Si ya es miembro del grupo, Yara bloquea invitaciones duplicadas.",
        icon: "people-outline",
    },
];

const QUICK_ACTIONS = [
    {
        label: "Metodos de cobro",
        description: "Configura Yape, Plin o banco",
        icon: "wallet-outline",
        onPress: () => router.push("/profile/yape"),
    },
    {
        label: "Actividad",
        description: "Revisa pagos, gastos e invitaciones",
        icon: "notifications-outline",
        onPress: () => router.push("/activity" as any),
    },
    {
        label: "Cambiar password",
        description: "Actualiza tu acceso",
        icon: "lock-closed-outline",
        onPress: () => router.push("/profile/password"),
    },
];

export default function HelpSupportScreen() {
    const openEmail = () => {
        const subject = encodeURIComponent("Soporte Yara");
        const body = encodeURIComponent(
            "Hola, necesito ayuda con Yara.\n\nDetalle del problema:\n"
        );
        Linking.openURL(`mailto:soporte@yara.app?subject=${subject}&body=${body}`);
    };

    const openWhatsApp = () => {
        const message = encodeURIComponent("Hola, necesito ayuda con Yara.");
        Linking.openURL(`https://wa.me/?text=${message}`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AmbientScreenBackground />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/(tabs)/profile" as any)}
                    activeOpacity={0.75}
                >
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ayuda y soporte</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="help-buoy-outline" size={30} color="#FFFFFF" />
                    </View>
                    <Text style={styles.heroTitle}>Estamos para ayudarte</Text>
                    <Text style={styles.heroText}>
                        Encuentra respuestas rapidas o contacta soporte si algo no cuadra en tus grupos, pagos o gastos.
                    </Text>
                </View>

                <Text style={styles.sectionLabel}>ACCESOS RAPIDOS</Text>
                <View style={styles.cardGroup}>
                    {QUICK_ACTIONS.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={styles.actionRow}
                            onPress={item.onPress}
                            activeOpacity={0.76}
                        >
                            <View style={styles.actionIcon}>
                                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.actionTextBox}>
                                <Text style={styles.actionTitle}>{item.label}</Text>
                                <Text style={styles.actionDescription}>{item.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                            {index < QUICK_ACTIONS.length - 1 && <View style={styles.rowDivider} />}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>PREGUNTAS FRECUENTES</Text>
                <View style={styles.faqList}>
                    {FAQS.map((item) => (
                        <View key={item.title} style={styles.faqCard}>
                            <View style={styles.faqTop}>
                                <View style={styles.faqIcon}>
                                    <Ionicons name={item.icon as any} size={19} color={COLORS.primary} />
                                </View>
                                <Text style={styles.faqTitle}>{item.title}</Text>
                            </View>
                            <Text style={styles.faqBody}>{item.body}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>CONTACTO</Text>
                <View style={styles.contactCard}>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={openEmail}
                        activeOpacity={0.82}
                    >
                        <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.contactButtonText}>Enviar correo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactButton, styles.contactButtonAlt]}
                        onPress={openWhatsApp}
                        activeOpacity={0.82}
                    >
                        <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
                        <Text style={styles.contactButtonAltText}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    Version 1.0.0 · {Platform.OS === "web" ? "Web" : "Mobile"}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F0F4FF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 8 : 24,
        paddingBottom: 12,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.text,
    },
    headerSpacer: {
        width: 42,
        height: 42,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    hero: {
        backgroundColor: "#1E293B",
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
    },
    heroIcon: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 25,
        fontWeight: "900",
        marginBottom: 8,
    },
    heroText: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 14,
        lineHeight: 21,
        fontWeight: "600",
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "900",
        color: "#64748B",
        letterSpacing: 1.3,
        marginBottom: 10,
        marginLeft: 4,
        marginTop: 4,
    },
    cardGroup: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 22,
    },
    actionRow: {
        minHeight: 76,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        position: "relative",
    },
    actionIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    actionTextBox: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 3,
    },
    actionDescription: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
    rowDivider: {
        position: "absolute",
        left: 70,
        right: 0,
        bottom: 0,
        height: 1,
        backgroundColor: "#F1F5F9",
    },
    faqList: {
        gap: 12,
        marginBottom: 22,
    },
    faqCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    faqTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 9,
    },
    faqIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    faqTitle: {
        flex: 1,
        color: "#1E293B",
        fontSize: 15,
        fontWeight: "800",
    },
    faqBody: {
        color: "#64748B",
        fontSize: 13,
        lineHeight: 20,
        fontWeight: "600",
    },
    contactCard: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    contactButton: {
        flex: 1,
        minHeight: 54,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    contactButtonAlt: {
        backgroundColor: "#F0FDF4",
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },
    contactButtonText: {
        color: "#FFFFFF",
        fontWeight: "900",
        fontSize: 14,
    },
    contactButtonAltText: {
        color: "#16A34A",
        fontWeight: "900",
        fontSize: 14,
    },
    footerText: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "700",
    },
});
