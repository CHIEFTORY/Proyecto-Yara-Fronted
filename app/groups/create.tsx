import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";

import { useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { COLORS } from "@/src/styles/colors";

import { createGroup } from "@/src/services/groupService";

const GROUP_COLORS = [
    "#2563EB",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
];

export default function CreateGroupScreen() {

    const [nombre, setNombre] = useState("");

    const [descripcion, setDescripcion] =
        useState("");

    const [selectedColor, setSelectedColor] =
        useState("#2563EB");

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const handleCreateGroup = async () => {

        if (!nombre.trim()) {

            setErrorMessage(
                "Ingresa un nombre para el grupo"
            );

            return;
        }

        try {

            setLoading(true);

            setErrorMessage("");

            await createGroup({
                nombre,
                descripcion,
            });

            Alert.alert(
                "Grupo creado",
                "Tu grupo fue creado correctamente"
            );

            router.back();

        } catch (error) {

            console.log(error);

            setErrorMessage(
                "No se pudo crear el grupo"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.header}>

                    <TouchableOpacity
                        onPress={() => router.back()}
                    >

                        <Text style={styles.back}>
                            ←
                        </Text>

                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Nuevo Grupo
                    </Text>

                </View>

                <View style={styles.iconContainer}>

                    <View
                        style={[
                            styles.iconCard,
                            {
                                backgroundColor:
                                selectedColor,
                            },
                        ]}
                    >

                        <Text style={styles.icon}>
                            👥
                        </Text>

                    </View>

                </View>

                <View style={styles.form}>

                    <Text style={styles.label}>
                        Nombre del grupo
                    </Text>

                    <TextInput
                        placeholder="Ej: Casa compartida"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                    />

                    <Text style={styles.label}>
                        Descripción (opcional)
                    </Text>

                    <TextInput
                        placeholder="Gastos mensuales del apartamento..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={4}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        style={[
                            styles.input,
                            styles.textArea,
                        ]}
                    />

                    <Text style={styles.label}>
                        Color del grupo
                    </Text>

                    <View style={styles.colorsContainer}>

                        {
                            GROUP_COLORS.map((color) => (

                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorCircle,
                                        {
                                            backgroundColor:
                                            color,
                                        },
                                        selectedColor ===
                                        color
                                            ? styles.selectedColor
                                            : null,
                                    ]}
                                    onPress={() =>
                                        setSelectedColor(
                                            color
                                        )
                                    }
                                />

                            ))
                        }

                    </View>

                    <View style={styles.tipCard}>

                        <Text style={styles.tipText}>
                            💡 Después de crear el grupo podrás invitar a tus amigos para empezar a dividir gastos
                        </Text>

                    </View>

                    {
                        errorMessage ? (

                            <Text style={styles.error}>
                                {errorMessage}
                            </Text>

                        ) : null
                    }

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateGroup}
                        disabled={loading}
                        activeOpacity={0.85}
                    >

                        {
                            loading ? (

                                <ActivityIndicator
                                    color="white"
                                />

                            ) : (

                                <Text
                                    style={
                                        styles.createButtonText
                                    }
                                >
                                    Crear grupo
                                </Text>

                            )
                        }

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() =>
                            router.back()
                        }
                    >

                        <Text style={styles.cancelText}>
                            Cancelar
                        </Text>

                    </TouchableOpacity>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 20,
        paddingBottom: 28,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,

        flexDirection: "row",
        alignItems: "center",
    },

    back: {
        color: "white",
        fontSize: 28,
        marginRight: 18,
    },

    headerTitle: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
    },

    iconContainer: {
        alignItems: "center",
        marginTop: 20,
    },

    iconCard: {
        width: 78,
        height: 78,
        borderRadius: 24,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,

        elevation: 8,
    },

    icon: {
        fontSize: 34,
    },

    form: {
        padding: 24,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 10,
        marginTop: 18,
    },

    input: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        color: COLORS.text,
    },

    textArea: {
        height: 110,
        textAlignVertical: "top",
    },

    colorsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
    },

    colorCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 10,
        marginBottom: 10,
    },

    selectedColor: {
        borderWidth: 3,
        borderColor: "#DBEAFE",
    },

    tipCard: {
        backgroundColor: "#DBEAFE",
        borderRadius: 18,
        padding: 18,
        marginTop: 24,
    },

    tipText: {
        color: "#475569",
        lineHeight: 22,
        fontSize: 14,
    },

    error: {
        color: "#EF4444",
        marginTop: 16,
        fontWeight: "500",
    },

    createButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 28,
    },

    createButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

    cancelButton: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 14,
        backgroundColor: "white",
    },

    cancelText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "500",
    },
});