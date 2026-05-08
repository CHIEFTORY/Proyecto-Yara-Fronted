import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";

import { useEffect, useState } from "react";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS } from "@/src/styles/colors";

import {
    getGroupSummary,
    getGroupUsers,
} from "@/src/services/groupService";

export default function GroupDetailScreen() {

    const { id } = useLocalSearchParams();

    const [summary, setSummary] =
        useState<any>(null);

    const [users, setUsers] =
        useState<string[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        loadGroup();

    }, []);

    const loadGroup = async () => {

        try {

            const summaryData =
                await getGroupSummary(
                    Number(id)
                );

            const usersData =
                await getGroupUsers(
                    Number(id)
                );

            setSummary(summaryData);

            setUsers(usersData);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <View style={styles.loaderContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />
            </View>
        );
    }

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={{
                paddingBottom: 100,
            }}
        >

            <Text style={styles.title}>
                Grupo
            </Text>

            <View style={styles.balanceCard}>

                <Text style={styles.balanceTitle}>
                    Balance total
                </Text>

                <Text style={styles.balance}>
                    S/ {summary?.balance || 0}
                </Text>

            </View>

            <View style={styles.section}>

                <View style={styles.row}>

                    <Text style={styles.sectionTitle}>
                        Miembros
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/groups/${id}/add-member` as any
                            )
                        }
                    >

                        <Text style={styles.addButton}>
                            + Agregar
                        </Text>

                    </TouchableOpacity>

                </View>

                {
                    users.map((user, index) => (

                        <View
                            key={index}
                            style={styles.userCard}
                        >

                            <Text style={styles.userName}>
                                {user}
                            </Text>

                        </View>

                    ))
                }

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

    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        marginTop: 50,
        color: COLORS.text,
    },

    balanceCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 28,
        padding: 28,
        marginTop: 28,
    },

    balanceTitle: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 16,
    },

    balance: {
        color: COLORS.white,
        fontSize: 40,
        fontWeight: "bold",
        marginTop: 10,
    },

    section: {
        marginTop: 34,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },

    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.text,
    },

    addButton: {
        color: COLORS.primary,
        fontWeight: "bold",
        fontSize: 16,
    },

    userCard: {
        backgroundColor: COLORS.white,
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
    },

    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
    },
});