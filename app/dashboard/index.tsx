import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickAction from "@/components/dashboard/QuickAction";
import GroupCard from "@/components/dashboard/GroupCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import {
    useFocusEffect,
} from "@react-navigation/native";
import { getMyGroups,getDashboardBalance } from "@/src/services/groupService";

import { router } from "expo-router";
import React,
{
    useEffect,
    useState,
} from "react";

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

    const [user, setUser] =
        useState<any>(null);

    const [groups, setGroups] =
        useState<any[]>([]);
    const [balance, setBalance] =
        useState<any>(null);
    useFocusEffect(

        React.useCallback(() => {

            loadDashboard();

        }, [])

    );

    const loadDashboard = async () => {

        try {

            const token =
                await getToken();

            if (!token) return;

            const userData =
                await getMeRequest();

            setUser(userData);

            const groupsData =
                await getMyGroups();

            setGroups(groupsData);

            const balanceData =
                await getDashboardBalance();

            setBalance(balanceData);

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

                <BalanceCard
                    balanceGeneral={
                        balance?.balanceGeneral || 0
                    }
                    totalDebes={
                        balance?.totalDebes || 0
                    }
                    totalTeDeben={
                        balance?.totalTeDeben || 0
                    }
                />

                <ExpenseChart />

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Acciones
                    </Text>

                    <View style={styles.quickActionsGrid}>


                        <QuickAction
                            title="Crear grupo"
                            icon="👥"
                            color="#9333EA"
                            background="#F3E8FF"
                            onPress={() => {
                                router.push(
                                    "/groups/create" as any
                                );
                            }}
                        />
                        <QuickAction
                            title="Métodos pago"
                            icon="💳"
                            color="#2563EB"
                            background="#DBEAFE"
                            onPress={() => {
                                router.push(
                                    "/payment-methods" as any
                                );
                            }}
                        />

                    </View>

                </View>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Mis grupos
                    </Text>

                    {
                        groups.length === 0 ? (

                            <View style={styles.emptyCard}>

                                <Text style={styles.emptyTitle}>
                                    No tienes grupos todavía
                                </Text>

                                <Text style={styles.emptySubtitle}>
                                    Crea tu primer grupo para empezar a dividir gastos
                                </Text>

                            </View>

                        ) : (

                            groups.map((group, index) => (

                                <GroupCard
                                    key={group.id}
                                    name={group.nombre}
                                    lastActivity={`${group.cantidadMiembros} miembros`}
                                    miBalance={group.miBalance}
                                    color="#3B82F6"
                                    onPress={() => {
                                        router.push(
                                            `/groups/${group.id}` as any
                                        );
                                    }}
                                />

                            ))

                        )
                    }

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
        gap: 12,
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

    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
    },

    emptySubtitle: {
        marginTop: 8,
        color: COLORS.subtitle,
        textAlign: "center",
        lineHeight: 22,
    },
    paymentButton: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,

        marginHorizontal: 20,
        marginBottom: 20,

        flexDirection: "row",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    paymentEmoji: {
        fontSize: 22,
        marginRight: 12,
    },

    paymentText: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
    },
});