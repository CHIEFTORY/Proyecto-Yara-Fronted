import { Alert } from "react-native";
import {
    getExpenseById,
    updateExpense,
} from "@/src/services/expenseService";
import { createExpense }
    from "@/src/services/expenseService";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,

} from "react-native";

import { useState, useEffect } from "react";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { COLORS } from "@/src/styles/colors";

import {
    getGroupUsers,
} from "@/src/services/groupService";

export default function CreateExpenseScreen() {

    const {
        id,
        expenseId,
    } = useLocalSearchParams();
    const editing =
        !!expenseId;


    const loadExpense = async () => {

        try {

            const data =
                await getExpenseById(
                    Number(expenseId)
                );

            setDescription(
                data.descripcion
            );

            setAmount(
                String(data.montoTotal)
            );

            setSplitType(
                data.tipoDivision
            );

            setPaidBy(
                data.pagadoPorId
            );

            setSelectedUsers(

                data.participantes.map(
                    (p: any) => p.usuarioId
                )
            );

            const amounts: any = {};

            data.participantes.forEach(
                (p: any) => {

                    amounts[p.usuarioId] =
                        String(p.monto);
                }
            );

            setCustomAmounts(
                amounts
            );

        } catch (error) {

            console.log(error);
        }
    };

    const [description, setDescription] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [splitType, setSplitType] =
        useState("IGUAL");

    const [users, setUsers] =
        useState<any[]>([]);

    const [paidBy, setPaidBy] =
        useState<number | null>(null);

    const [selectedUsers, setSelectedUsers] =
        useState<number[]>([]);

    const [customAmounts, setCustomAmounts] =
        useState<any>({});

    useEffect(() => {

        loadUsers();

    }, []);
    useEffect(() => {

        if (splitType === "IGUAL") {

            setCustomAmounts({});
        }

    }, [splitType]);
    useEffect(() => {

        if (!editing) return;

        loadExpense();

    }, []);

    const loadUsers = async () => {

        try {

            const data =
                await getGroupUsers(
                    Number(id)
                );

            setUsers(data);
            if (data.length > 0) {

                setPaidBy(data[0].id);
            }

            setSelectedUsers(
                data.map(
                    (u: any) => u.id
                )
            );

        } catch (error) {

            console.log(error);
        }
    };

    const toggleUser = (userId: number) => {

        if (
            selectedUsers.includes(userId)
        ) {

            setSelectedUsers(
                selectedUsers.filter(
                    id => id !== userId
                )
            );

        } else {

            setSelectedUsers([
                ...selectedUsers,
                userId
            ]);
        }
    };

    const equalAmount = () => {

        if (
            !amount ||
            selectedUsers.length === 0
        ) {
            return "0";
        }

        return (
            Number(amount)
            / selectedUsers.length
        ).toFixed(2);
    };

    const handleSave = async () => {

        try {

            if (!description || !amount) {

                Alert.alert(
                    "Error",
                    "Completa todos los campos"
                );

                return;
            }

            if (
                splitType === "IGUAL"
                && selectedUsers.length === 0
            ) {

                Alert.alert(
                    "Error",
                    "Selecciona participantes"
                );

                return;
            }

            let participantes = [];

            // =========================
            // DIVISIÓN IGUALITARIA
            // =========================

            if (splitType === "IGUAL") {

                const splitAmount =
                    Number(
                        (
                            Number(amount)
                            / selectedUsers.length
                        ).toFixed(2)
                    );

                participantes =
                    selectedUsers.map(
                        (userId) => ({

                            usuarioId: userId,

                            monto: Number(
                                splitAmount.toFixed(2)
                            ),
                        })
                    );

            }

                // =========================
                // DIVISIÓN PERSONALIZADA
            // =========================

            else {

                participantes =
                    users
                        .filter(user =>

                            Number(
                                customAmounts[user.id]
                            ) > 0
                        )
                        .map(user => ({

                            usuarioId: user.id,

                            monto: Number(
                                customAmounts[user.id]
                            ),
                        }));

                if (participantes.length === 0) {

                    Alert.alert(
                        "Error",
                        "Ingresa al menos un participante"
                    );

                    return;
                }

                const payerIncluded =
                    participantes.some(

                        p =>
                            p.usuarioId === paidBy
                    );

                if (!payerIncluded) {

                    Alert.alert(

                        "Error",

                        "La persona que pagó debe participar en el gasto"
                    );

                    return;
                }

                const total =
                    participantes.reduce(
                        (sum, p) =>
                            sum + p.monto,
                        0
                    );

                if (
                    Number(total.toFixed(2))
                    !==
                    Number(amount)
                ) {

                    Alert.alert(
                        "Error",
                        "La suma no coincide con el monto total"
                    );

                    return;
                }
            }

            const payload = {

                grupoId: Number(id),

                pagadoPorId: paidBy,

                descripcion: description,

                monto: Number(amount),

                tipoDivision: splitType,

                participantes,

                categorias: [
                    {
                        categoriaId: 1,
                        monto: Number(amount),
                    }
                ],
            };

            if (editing) {

                await updateExpense(
                    Number(expenseId),
                    payload
                );

            } else {

                await createExpense(
                    payload
                );
            }

            Alert.alert(
                "Éxito",
                editing
                    ? "Gasto actualizado"
                    : "Gasto registrado"
            );

            router.back();

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Error",
                "No se pudo guardar"
            );
        }
    };

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={{
                paddingBottom: 120,
            }}
        >

            <Text style={styles.title}>
                {
                    editing
                        ? "Editar gasto"
                        : "Nuevo gasto"
                }
            </Text>

            <View style={styles.card}>

                <Text style={styles.label}>
                    Descripción
                </Text>

                <TextInput
                    placeholder="Ej. Pizza"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                />

                <Text style={styles.label}>
                    Monto total
                </Text>

                <TextInput
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    style={styles.input}
                />

            </View>

            <View style={styles.card}>

                <Text style={styles.label}>
                    División
                </Text>

                <View style={styles.splitRow}>

                    <TouchableOpacity
                        style={[
                            styles.splitButton,
                            splitType === "IGUAL"
                                ? styles.activeSplit
                                : null,
                        ]}
                        onPress={() =>
                            setSplitType("IGUAL")
                        }
                    >

                        <Text
                            style={[
                                styles.splitText,
                                splitType === "IGUAL"
                                    ? styles.activeSplitText
                                    : null,
                            ]}
                        >
                            Igualitario
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.splitButton,
                            splitType === "PERSONALIZADO"
                                ? styles.activeSplit
                                : null,
                        ]}
                        onPress={() =>
                            setSplitType(
                                "PERSONALIZADO"
                            )
                        }
                    >

                        <Text
                            style={[
                                styles.splitText,
                                splitType === "PERSONALIZADO"
                                    ? styles.activeSplitText
                                    : null,
                            ]}
                        >
                            Personalizado

                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

            <View style={styles.card}>

                <Text style={styles.label}>
                    Pagado por
                </Text>

                <Text style={styles.helperText}>
                    Esta persona pagó el gasto completo.
                </Text>

                <View style={styles.payerContainer}>

                    {
                        users.map((user) => (

                            <TouchableOpacity
                                key={user.id}
                                style={[
                                    styles.payerButton,

                                    paidBy === user.id
                                        ? styles.activePayer
                                        : null,
                                ]}
                                onPress={() =>
                                    setPaidBy(user.id)
                                }
                            >

                                <Text
                                    style={[
                                        styles.payerText,

                                        paidBy === user.id
                                            ? styles.activePayerText
                                            : null,
                                    ]}
                                >
                                    {user.nombre}
                                </Text>

                            </TouchableOpacity>

                        ))
                    }

                </View>

                <Text style={styles.label}>
                    Participantes
                </Text>
                {
                    splitType === "PERSONALIZADO" && (

                        <Text style={styles.helperText}>
                            Ingresa cuánto debe cada participante.
                            Deja vacío o 0 para excluirlo.
                        </Text>

                    )
                }
                {
                    users.map((user) => {

                        const selected =
                            selectedUsers.includes(
                                user.id
                            );

                        return (

                            <TouchableOpacity
                                key={user.id}
                                style={styles.userRow}
                                onPress={() => {

                                    if (splitType === "IGUAL") {

                                        toggleUser(user.id);
                                    }
                                }}
                            >

                                <View style={styles.left}>

                                    <View style={styles.avatar}>

                                        <Text style={styles.avatarText}>
                                            {
                                                user.nombre.charAt(0)
                                            }
                                        </Text>

                                    </View>

                                    <View>

                                        <Text style={styles.userName}>
                                            {user.nombre}
                                        </Text>

                                        <Text style={styles.userEmail}>
                                            {user.email}
                                        </Text>

                                    </View>

                                </View>

                                {
                                    splitType ===
                                    "PERSONALIZADO" ? (

                                        <TextInput
                                            placeholder="Debe"
                                            keyboardType="numeric"
                                            style={styles.customInput}
                                            value={
                                                customAmounts[
                                                    user.id
                                                    ] || ""
                                            }
                                            onChangeText={(value) => {

                                                setCustomAmounts({
                                                    ...customAmounts,
                                                    [user.id]: value,
                                                });

                                            }}
                                        />

                                    ) : (

                                        <View
                                            style={[
                                                styles.checkbox,
                                                selected
                                                    ? styles.checked
                                                    : null,
                                            ]}
                                        />

                                    )
                                }

                            </TouchableOpacity>

                        );
                    })
                }

            </View>

            {
                splitType === "IGUAL" && (

                    <View style={styles.equalCard}>

                        <Text style={styles.equalText}>
                            Cada participante pagará
                        </Text>

                        <Text style={styles.equalAmount}>
                            S/ {equalAmount()}
                        </Text>

                    </View>

                )
            }

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
            >

                <Text style={styles.saveText}>
                    {
                        editing
                            ? "Actualizar gasto"
                            : "Guardar gasto"
                    }
                </Text>

            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        marginTop: 60,
        color: COLORS.text,
        marginBottom: 24,
    },

    card: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 18,

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    label: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 12,
    },

    input: {
        backgroundColor: "#F1F5F9",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 20,
        fontSize: 16,
    },

    splitRow: {
        flexDirection: "row",
    },

    splitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        backgroundColor: "#E2E8F0",
        marginRight: 10,
    },

    activeSplit: {
        backgroundColor: COLORS.primary,
    },

    splitText: {
        color: COLORS.text,
        fontWeight: "600",
    },

    activeSplitText: {
        color: "white",
    },

    userRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },

    left: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#DBEAFE",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 14,
    },

    avatarText: {
        color: COLORS.primary,
        fontWeight: "bold",
        fontSize: 18,
    },

    userName: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
    },

    userEmail: {
        marginTop: 4,
        color: COLORS.subtitle,
        fontSize: 13,
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },

    checked: {
        backgroundColor: COLORS.primary,
    },

    customInput: {
        width: 90,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        textAlign: "center",
    },

    equalCard: {
        backgroundColor: "#DBEAFE",
        borderRadius: 22,
        padding: 24,
        alignItems: "center",
        marginBottom: 22,
    },

    equalText: {
        color: COLORS.primary,
        fontWeight: "600",
    },

    equalAmount: {
        marginTop: 10,
        fontSize: 32,
        fontWeight: "bold",
        color: COLORS.primary,
    },

    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        marginBottom: 50,
    },

    saveText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },

    payerContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },

    payerButton: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 10,
        marginBottom: 10,
    },

    activePayer: {
        backgroundColor: COLORS.primary,
    },

    payerText: {
        color: COLORS.text,
        fontWeight: "600",
    },

    activePayerText: {
        color: "white",
    },

    helperText: {
        color: COLORS.subtitle,
        fontSize: 13,
        marginBottom: 14,
        lineHeight: 18,
    },
});