import Header from "@/components/dashboard/Header";
import SummaryCard from "@/components/dashboard/SummaryCard";
import QuickAction from "@/components/dashboard/QuickAction";
import GroupCard from "@/components/dashboard/GroupCard";
import ActivityItem from "@/components/dashboard/ActivityItem";

import ExpenseChart from "@/components/dashboard/ExpenseChart";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

export default function DashboardScreen() {

    return (

        <ScrollView style={styles.container}>

            <Header />

            <SummaryCard
                title="Te deben"
                amount="$350"
                color="#22C55E"
                background="#ECFDF3"
                percent="+12%"
            />

            <SummaryCard
                title="Debes"
                amount="$195"
                color="#EF4444"
                background="#FEF2F2"
                percent="-8%"
            />

            <SummaryCard
                title="Balance neto"
                amount="+$155"
                color="#2563EB"
                background="#EFF6FF"
                percent="+4%"
            />

            <ExpenseChart />

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    Acciones rápidas
                </Text>

                <View style={styles.quickActionsGrid}>

                    <QuickAction
                        title="Nuevo gasto"
                        icon="💸"
                        color="#2563EB"
                        background="#DBEAFE"
                    />

                    <QuickAction
                        title="Registrar pago"
                        icon="💳"
                        color="#10B981"
                        background="#D1FAE5"
                    />

                    <QuickAction
                        title="Crear grupo"
                        icon="👥"
                        color="#9333EA"
                        background="#F3E8FF"
                    />

                    <QuickAction
                        title="Auditoría"
                        icon="📈"
                        color="#F97316"
                        background="#FFEDD5"
                    />

                </View>

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    Mis grupos
                </Text>

                <GroupCard
                    name="Apartamento"
                    members="4 miembros"
                    amount="$150"
                    color="#3B82F6"
                />

                <GroupCard
                    name="Viaje a la playa"
                    members="6 miembros"
                    amount="+$230"
                    color="#9333EA"
                />

                <GroupCard
                    name="Familia"
                    members="5 miembros"
                    amount="$45"
                    color="#22C55E"
                />

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    Actividad reciente
                </Text>

                <View style={styles.activityCard}>

                    <ActivityItem
                        title="Supermercado"
                        subtitle="María García • Apartamento"
                        amount="$85"
                    />

                    <ActivityItem
                        title="Pago recibido"
                        subtitle="Carlos López • Viaje a la playa"
                        amount="+$120"
                        positive
                    />

                    <ActivityItem
                        title="Cena restaurante"
                        subtitle="Tú • Familia"
                        amount="$65"
                    />

                    <ActivityItem
                        title="Pago enviado a Ana"
                        subtitle="Tú • Apartamento"
                        amount="$100"
                    />

                </View>

            </View>




        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 14,
    },
    activityCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 22,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },











    section: {
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        color: COLORS.text,
    },


});