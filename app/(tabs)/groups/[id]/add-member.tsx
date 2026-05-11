import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";

import { useState } from "react";

import { useLocalSearchParams } from "expo-router";

import { COLORS } from "@/src/styles/colors";

import { searchUsers } from "@/src/services/userService";

import { addUserToGroup } from "@/src/services/groupService";

export default function AddMemberScreen() {

    const { id } = useLocalSearchParams();

    const [query, setQuery] = useState("");

    const [users, setUsers] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const handleSearch = async (
        text: string
    ) => {

        setQuery(text);

        if (text.length < 2) {

            setUsers([]);

            return;
        }

        try {

            setLoading(true);

            const data =
                await searchUsers(text);

            setUsers(data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    const handleAddUser = async (
        userId: number
    ) => {

        try {

            await addUserToGroup(
                Number(id),
                userId
            );

            Alert.alert(
                "Usuario agregado"
            );

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Error",
                "No se pudo agregar"
            );
        }
    };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Invitar miembros
            </Text>

            <Text style={styles.subtitle}>
                Busca personas por correo para agregarlas al grupo
            </Text>

            <View style={styles.searchContainer}>

                <Text style={styles.searchIcon}>
                    🔍
                </Text>

                <TextInput
                    placeholder="Buscar usuario..."
                    placeholderTextColor={COLORS.subtitle}
                    style={styles.input}
                    value={query}
                    onChangeText={handleSearch}
                />

            </View>

            {
                loading && (

                    <ActivityIndicator
                        color={COLORS.primary}
                        style={{
                            marginTop: 20,
                        }}
                    />
                )
            }

            {
                !loading && query.length < 2 && (

                    <View style={styles.emptyState}>

                        <Text style={styles.emptyEmoji}>
                            👥
                        </Text>

                        <Text style={styles.emptyTitle}>
                            Busca usuarios
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Escribe un nombre o correo para comenzar
                        </Text>

                    </View>

                )
            }

            <FlatList
                data={users}
                keyExtractor={(item) =>
                    item.id.toString()
                }

                showsVerticalScrollIndicator={false}

                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 40,
                }}

                renderItem={({ item }) => (

                    <View style={styles.userCard}>

                        <View style={styles.userLeft}>

                            <View style={styles.avatar}>

                                <Text style={styles.avatarText}>
                                    {item.nombre?.charAt(0)}
                                </Text>

                            </View>

                            <View style={{
                                flex: 1,
                            }}>

                                <Text style={styles.name}>
                                    {item.nombre}
                                </Text>

                                <Text style={styles.email}>
                                    {item.email}
                                </Text>

                            </View>

                        </View>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() =>
                                handleAddUser(item.id)
                            }
                        >

                            <Text style={styles.addButtonText}>
                                Agregar
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}

                ListEmptyComponent={

                    query.length >= 2
                        ? (

                            <View style={styles.emptyState}>

                                <Text style={styles.emptyEmoji}>
                                    🔎
                                </Text>

                                <Text style={styles.emptyTitle}>
                                    Sin resultados
                                </Text>

                                <Text style={styles.emptySubtitle}>
                                    No encontramos usuarios
                                </Text>

                            </View>

                        )
                        : null
                }
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginTop: 50,
        marginBottom: 24,
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.subtitle,
        marginBottom: 28,
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: COLORS.white,

        borderRadius: 20,

        paddingHorizontal: 18,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },

    input: {
        flex: 1,
        paddingVertical: 18,
        color: COLORS.text,
    },

    userCard: {
        backgroundColor: COLORS.white,

        padding: 18,

        borderRadius: 22,

        marginBottom: 14,

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    userLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    avatar: {
        width: 54,
        height: 54,

        borderRadius: 18,

        backgroundColor: "#E0E7FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 14,
    },

    avatarText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: "bold",
    },

    addButton: {
        backgroundColor: COLORS.primary,

        paddingHorizontal: 18,
        paddingVertical: 10,

        borderRadius: 14,
    },

    addButtonText: {
        color: "white",
        fontWeight: "700",
    },

    emptyState: {
        alignItems: "center",
        marginTop: 80,
    },

    emptyEmoji: {
        fontSize: 42,
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.text,
    },

    emptySubtitle: {
        marginTop: 8,
        color: COLORS.subtitle,
        textAlign: "center",
    },

    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.text,
    },

    email: {
        marginTop: 4,
        color: COLORS.subtitle,
    },
});