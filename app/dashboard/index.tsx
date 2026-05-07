import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickAction from "@/components/dashboard/QuickAction";
import GroupCard from "@/components/dashboard/GroupCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import FloatingButton from "@/components/dashboard/FloatingButton";
import ExpenseChart from "@/components/dashboard/ExpenseChart";

import { useEffect, useState } from "react";

import { getToken } from "@/src/utils/authStorage";

import { getMeRequest } from "@/src/services/authService";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";

import { COLORS } from "@/src/styles/colors";

export default function DashboardScreen() {

    const [user, setUser] = useState<any>(null);

    useEffect(() => {

        loadUser();

    }, []);

    const loadUser = async () => {

        try {

            const token = await getToken();

            if (!token) return;

            const userData = await getMeRequest(
                token
            );

            setUser(userData);

        } catch (error) {

            console.log(error);
        }
    };

    return (

        <View style={{ flex: 1 }}>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingBottom: 120,
                }}
            >

                <Header
                    name={user?.nombre || "Usuario"}
                />

                <BalanceCard />

                <ExpenseChart />

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Acciones
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

                    </View>

                </View>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Mis grupos
                    </Text>

                    <GroupCard
                        name="Apartamento"
                        lastActivity="Último gasto: Netflix"
                        amount="$150"
                        color="#3B82F6"
                    />

                    <GroupCard
                        name="Viaje a la playa"
                        lastActivity="Último gasto: Hotel"
                        amount="+$230"
                        color="#9333EA"
                    />

                    <GroupCard
                        name="Familia"
                        lastActivity="Último gasto: Cena"
                        amount="$45"
                        color="#22C55E"
                    />

                </View>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Actividad
                    </Text>

                    <View style={styles.activityCard}>

                        <ActivityItem
                            title="Supermercado"
                            subtitle="María García • Apartamento"
                            amount="$85"
                            time="Hace 2h"
                        />

                        <ActivityItem
                            title="Pago recibido"
                            subtitle="Carlos López • Viaje a la playa"
                            amount="+$120"
                            time="Ayer"
                            positive
                        />

                        <ActivityItem
                            title="Cena restaurante"
                            subtitle="Tú • Familia"
                            amount="$65"
                            time="Hace 5h"
                        />

                        <ActivityItem
                            title="Pago enviado a Ana"
                            subtitle="Tú • Apartamento"
                            amount="$100"
                            time="Hace 1 día"
                        />

                    </View>

                </View>

            </ScrollView>

            <FloatingButton />

        </View>
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