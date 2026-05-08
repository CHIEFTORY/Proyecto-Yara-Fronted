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
                Agregar miembro
            </Text>

            <TextInput
                placeholder="Buscar usuario..."
                placeholderTextColor={COLORS.subtitle}
                style={styles.input}
                value={query}
                onChangeText={handleSearch}
            />

            {
                loading && (
                    <ActivityIndicator
                        color={COLORS.primary}
                    />
                )
            }

            <FlatList
                data={users}
                keyExtractor={(item) =>
                    item.id.toString()
                }
                renderItem={({ item }) => (

                    <TouchableOpacity
                        style={styles.userCard}
                        onPress={() =>
                            handleAddUser(item.id)
                        }
                    >

                        <View>

                            <Text style={styles.name}>
                                {item.nombre}
                            </Text>

                            <Text style={styles.email}>
                                {item.email}
                            </Text>

                        </View>

                    </TouchableOpacity>

                )}
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

    input: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    userCard: {
        backgroundColor: COLORS.white,
        padding: 18,
        borderRadius: 18,
        marginBottom: 14,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
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