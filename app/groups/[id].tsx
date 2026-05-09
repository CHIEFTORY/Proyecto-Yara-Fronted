import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Alert } from "react-native";
import {
    useState,
    useCallback,
} from "react";

import { useFocusEffect } from "@react-navigation/native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS } from "@/src/styles/colors";

import {
    getGroupSummary,
    getGroupUsers,
    deleteGroup,
} from "@/src/services/groupService";

export default function GroupDetailScreen() {

    const { id } = useLocalSearchParams();

    const [summary, setSummary] =
        useState<any>(null);

    const [users, setUsers] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [activeTab, setActiveTab] =
        useState("balances");

    useFocusEffect(
        useCallback(() => {

            loadGroup();

        }, [])
    );
    const openGroupMenu = () => {

        Alert.alert(

            "Opciones del grupo",

            "Selecciona una opción",

            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },



                {
                    text: "Salir del grupo",
                    onPress: () => {

                        console.log(
                            "Salir grupo"
                        );
                    }
                },

                {
                    text: "Eliminar grupo",

                    onPress: async () => {

                        try {

                            await deleteGroup(
                                Number(id)
                            );

                            router.replace("/");

                        } catch (error) {

                            console.log(error);
                        }
                    }
                }
            ]
        );
    };

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
                paddingBottom: 120,
            }}
        >

            <View style={styles.header}>

                <View style={styles.headerTop}>

                    <View>

                        <Text style={styles.groupName}>
                            {summary?.nombre || "Grupo"}
                        </Text>

                        <Text style={styles.membersCount}>
                            {users.length} miembros
                        </Text>

                    </View>

                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={openGroupMenu}
                    >

                        <Text style={styles.settingsIcon}>
                            ⚙️
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

            <View style={styles.actionsRow}>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {

                        router.push(
                            `/groups/${id}/create-expense`
                        );

                    }}
                >

                    <Text style={styles.actionIcon}>
                        💸
                    </Text>

                    <Text style={styles.actionText}>
                        Nuevo gasto
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {

                        router.push(
                            `/groups/${id}/add-member`
                        );

                    }}
                >

                    <Text style={styles.actionIcon}>
                        👤
                    </Text>

                    <Text style={styles.actionText}>
                        Invitar
                    </Text>

                </TouchableOpacity>

            </View>

            <View style={styles.tabs}>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "balances"
                            ? styles.activeTab
                            : null,
                    ]}
                    onPress={() =>
                        setActiveTab("balances")
                    }
                >

                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "balances"
                                ? styles.activeTabText
                                : null,
                        ]}
                    >
                        Balances
                    </Text>

                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "gastos"
                            ? styles.activeTab
                            : null,
                    ]}
                    onPress={() =>
                        setActiveTab("gastos")
                    }
                >

                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "gastos"
                                ? styles.activeTabText
                                : null,
                        ]}
                    >
                        Gastos
                    </Text>

                </TouchableOpacity>

            </View>

            {
                activeTab === "balances" && (

                    <>

                        <View style={styles.listContainer}>

                            {
                                users.map((user) => {

                                    const balance =
                                        summary?.balances
                                            ?.find(
                                                (b: any) =>
                                                    b.usuarioId === user.id
                                            );

                                    const monto =
                                        balance?.balance || 0;

                                    const positive =
                                        monto > 0;

                                    const emptyBalance =
                                        monto === 0;

                                    return (

                                        <View
                                            key={user.id}
                                            style={styles.userCard}
                                        >

                                            <View style={styles.avatar}>

                                                <Text style={styles.avatarText}>
                                                    {user.nombre.charAt(0)}
                                                </Text>

                                            </View>

                                            <View style={styles.userInfo}>

                                                <View style={styles.nameRow}>

                                                    <Text
                                                        numberOfLines={1}
                                                        style={styles.userName}
                                                    >
                                                        {user.nombre}
                                                    </Text>

                                                    {
                                                        user.rol === "ADMIN" && (

                                                            <View style={styles.adminBadge}>

                                                                <Text style={styles.adminText}>
                                                                    Admin
                                                                </Text>

                                                            </View>

                                                        )
                                                    }

                                                </View>

                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.userEmail}
                                                >
                                                    {user.email}
                                                </Text>

                                                {
                                                    emptyBalance ? (

                                                        <Text style={styles.noDebt}>
                                                            Sin deudas
                                                        </Text>

                                                    ) : (

                                                        <View style={styles.balanceContainer}>

                                                            <Text
                                                                style={[
                                                                    styles.balanceText,
                                                                    {
                                                                        color:
                                                                            positive
                                                                                ? "#10B981"
                                                                                : "#EF4444",
                                                                    }
                                                                ]}
                                                            >
                                                                {
                                                                    positive
                                                                        ? "+"
                                                                        : "-"
                                                                }

                                                                S/ {Math.abs(monto)}
                                                            </Text>

                                                            <Text
                                                                style={[
                                                                    styles.balanceStatus,
                                                                    {
                                                                        color:
                                                                            positive
                                                                                ? "#10B981"
                                                                                : "#EF4444",
                                                                    }
                                                                ]}
                                                            >
                                                                {
                                                                    positive
                                                                        ? "recibe"
                                                                        : "debe"
                                                                }
                                                            </Text>

                                                        </View>

                                                    )
                                                }

                                            </View>

                                        </View>

                                    );
                                })
                            }

                        </View>

                        <View style={styles.debtSection}>

                            <Text style={styles.debtTitle}>
                                Deudas pendientes
                            </Text>

                            {
                                summary?.deudas?.length === 0 ? (

                                    <Text style={styles.noDebtText}>
                                        No hay deudas pendientes
                                    </Text>

                                ) : (

                                    summary?.deudas?.map(
                                        (deuda: any, index: number) => (

                                            <View
                                                key={index}
                                                style={styles.debtCard}
                                            >

                                                <Text style={styles.debtDescription}>

                                                    <Text style={styles.bold}>
                                                        {deuda.deudor}
                                                    </Text>

                                                    {" debe S/ "}

                                                    <Text style={styles.bold}>
                                                        {deuda.monto}
                                                    </Text>

                                                    {" a "}

                                                    <Text style={styles.bold}>
                                                        {deuda.acreedor}
                                                    </Text>

                                                </Text>

                                            </View>

                                        )
                                    )

                                )
                            }

                        </View>

                    </>

                )
            }

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    header: {
        backgroundColor: COLORS.primary,

        paddingTop: 70,
        paddingHorizontal: 24,

        paddingBottom: 110,

        borderBottomLeftRadius: 38,
        borderBottomRightRadius: 38,
    },

    groupName: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
    },

    membersCount: {
        color: "rgba(255,255,255,0.75)",
        marginTop: 6,
        fontSize: 14,
    },

    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",

        paddingHorizontal: 30,

        marginTop: -88,
    },

    actionButton: {
        flex: 1,

        backgroundColor: "rgba(255,255,255,0.32)",

        borderRadius: 16,

        paddingVertical: 14,

        alignItems: "center",

        marginHorizontal: 6,
    },

    actionIcon: {
        fontSize: 18,
        marginBottom: 4,
    },

    actionText: {
        color: "white",
        fontWeight: "600",
        fontSize: 13,
    },

    tabs: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
        marginHorizontal: 20,
        borderRadius: 18,
        padding: 5,
        marginTop: 28,
    },

    tabButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },

    activeTab: {
        backgroundColor: "white",
    },

    tabText: {
        color: "#64748B",
        fontWeight: "700",
        fontSize: 15,
    },

    activeTabText: {
        color: COLORS.text,
    },

    listContainer: {
        padding: 20,
    },

    userCard: {
        backgroundColor: "white",
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,

        flexDirection: "row",
        alignItems: "flex-start",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,

        elevation: 2,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E0E7FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 14,
    },

    avatarText: {
        color: COLORS.primary,
        fontWeight: "bold",
        fontSize: 22,
    },

    userInfo: {
        flex: 1,
        justifyContent: "center",
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.text,
        maxWidth: "72%",
    },

    userEmail: {
        color: COLORS.subtitle,
        marginTop: 6,
        fontSize: 14,
    },

    adminBadge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginLeft: 8,
    },

    adminText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "bold",
    },

    balanceContainer: {
        marginTop: 12,
    },

    balanceText: {
        fontSize: 18,
        fontWeight: "bold",
    },

    balanceStatus: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: "600",
    },

    noDebt: {
        marginTop: 12,
        color: COLORS.subtitle,
        fontSize: 14,
        fontWeight: "600",
    },

    debtSection: {
        paddingHorizontal: 20,
        marginTop: 6,
    },

    debtTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 16,
    },

    debtCard: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    debtDescription: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
    },

    bold: {
        fontWeight: "bold",
    },

    noDebtText: {
        color: COLORS.subtitle,
        fontSize: 14,
    },

    deleteButton: {
        backgroundColor: "#EF4444",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 30,
        marginBottom: 50,
    },

    deleteText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },

    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,

        backgroundColor: "rgba(255,255,255,0.18)",

        justifyContent: "center",
        alignItems: "center",
    },

    settingsIcon: {
        fontSize: 20,
    },
});