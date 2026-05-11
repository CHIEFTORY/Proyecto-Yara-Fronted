import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { router } from "expo-router";

import { COLORS } from "@/src/styles/colors";

import { getMyGroups } from "@/src/services/groupService";

export default function GroupsScreen() {

    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadGroups();

    }, []);

    const loadGroups = async () => {

        try {

            const data = await getMyGroups();

            setGroups(data);

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

        <View style={{ flex: 1 }}>

    <ScrollView
        style={styles.container}
    contentContainerStyle={{
        paddingBottom: 120,
    }}
>

    <Text style={styles.title}>
        Mis grupos
    </Text>

    <Text style={styles.subtitle}>
        Gestiona tus gastos compartidos
    </Text>

    {
        groups.length === 0 ? (

            <View style={styles.emptyCard}>

            <Text style={styles.emptyTitle}>
                No tienes grupos aún
    </Text>

    <Text style={styles.emptySubtitle}>
        Crea tu primer grupo para comenzar
    </Text>

    </View>

    ) : (

        groups.map((group: any, index: number) => (

            <TouchableOpacity
                key={index}
        style={styles.groupCard}
        onPress={() =>
        router.push(`/groups/${group.id}` as any)
    }
    >

        <View style={styles.avatar}>

        <Text style={styles.avatarText}>
            {group.nombre?.charAt(0)}
            </Text>

            </View>

            <View style={{ flex: 1 }}>

        <Text style={styles.groupName}>
            {group.nombre}
            </Text>

            <Text style={styles.groupSubtitle}>
        Ver detalles del grupo
    </Text>

    </View>

    <Text style={styles.arrow}>
                                    →
                                </Text>

                                </TouchableOpacity>

    ))
    )
    }

    </ScrollView>

    <TouchableOpacity
    style={styles.fab}
    onPress={() =>
    router.push("/groups/create" as any)
}
>

    <Text style={styles.fabText}>
        +
            </Text>

        </TouchableOpacity>

        </View>
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
        backgroundColor: COLORS.background,
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: COLORS.text,
        marginTop: 40,
    },

    subtitle: {
        fontSize: 16,
        color: COLORS.subtitle,
        marginTop: 8,
        marginBottom: 30,
    },

    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 28,
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,

        elevation: 3,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.text,
    },

    emptySubtitle: {
        marginTop: 10,
        fontSize: 15,
        color: COLORS.subtitle,
        textAlign: "center",
    },

    groupCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 22,
        marginBottom: 18,

        flexDirection: "row",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,

        elevation: 3,
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#EEF2FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 16,
    },

    avatarText: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: "bold",
    },

    groupName: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
    },

    groupSubtitle: {
        marginTop: 6,
        color: COLORS.subtitle,
        fontSize: 14,
    },

    arrow: {
        fontSize: 24,
        color: COLORS.subtitle,
    },

    fab: {
        position: "absolute",
        right: 24,
        bottom: 34,

        width: 64,
        height: 64,

        borderRadius: 22,

        backgroundColor: COLORS.primary,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,

        elevation: 8,
    },

    fabText: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: "bold",
        marginTop: -2,
    },
});