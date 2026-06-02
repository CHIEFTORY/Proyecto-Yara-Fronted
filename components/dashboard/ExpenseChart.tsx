import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { BarChart } from "react-native-chart-kit";
import { COLORS } from "@/src/styles/colors";
import { getExpenseChart } from "@/src/services/expenseService";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function ExpenseChart() {
    const [chartData, setChartData] = useState<{ mes: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadChart(); }, []);

    const loadChart = async () => {
        try {
            const data = await getExpenseChart();
            setChartData(data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const total = chartData.reduce((acc, d) => acc + d.total, 0);
    const maxMes = chartData.reduce((max, d) => d.total > (max?.total ?? 0) ? d : max, chartData[0]);

    return (
        <View style={styles.card}>

            {/* Header con resumen */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>RESUMEN</Text>
                    <Text style={styles.title}>Gastos mensuales</Text>
                </View>
                {!loading && chartData.length > 0 && (
                    <View style={styles.totalPill}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>S/ {total.toFixed(0)}</Text>
                    </View>
                )}
            </View>

            {/* Máximo del periodo */}
            {!loading && maxMes && (
                <View style={styles.peakRow}>
                    <Ionicons name="trending-up-outline" size={15} color={COLORS.primary} />
                    <Text style={styles.peakText}>
                        Pico en <Text style={styles.peakBold}>{maxMes.mes}</Text> - S/ {maxMes.total.toFixed(0)}
                    </Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingBox}>
                    <Text style={styles.loadingText}>Cargando gráfico...</Text>
                </View>
            ) : chartData.length === 0 ? (
                <View style={styles.emptyBox}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons name="bar-chart-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyText}>Sin datos todavía</Text>
                </View>
            ) : (
                <BarChart
                    data={{
                        labels: chartData.map(d => d.mes),
                        datasets: [{ data: chartData.map(d => d.total || 0) }],
                    }}
                    width={screenWidth - 84}
                    height={220}
                    yAxisLabel="S/ "
                    yAxisSuffix=""
                    fromZero
                    showValuesOnTopOfBars={false}
                    chartConfig={{
                        backgroundGradientFrom: "#FFFFFF",
                        backgroundGradientTo: "#FFFFFF",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                        labelColor: () => "#94A3B8",
                        barPercentage: 0.65,
                        propsForBackgroundLines: { stroke: "#F1F5F9", strokeDasharray: "4 4" },
                        propsForLabels: { fontSize: 11, fontWeight: "600" },
                    }}
                    style={styles.chart}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 26,
        padding: 22,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: "#94A3B8",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    header: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 12,
    },
    eyebrow: {
        fontSize: 11, fontWeight: "700", letterSpacing: 0,
        color: COLORS.primary, opacity: 0.5, marginBottom: 2,
    },
    title: {
        fontSize: 20, fontWeight: "800",
        color: COLORS.text, letterSpacing: 0,
    },
    totalPill: {
        backgroundColor: "#EEF2FF", borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 8, alignItems: "flex-end",
    },
    totalLabel: { fontSize: 10, fontWeight: "600", color: "#6366F1", letterSpacing: 0 },
    totalAmount: { fontSize: 16, fontWeight: "800", color: "#4F46E5", letterSpacing: 0 },
    peakRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "#F8FAFC", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
    },
    peakText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
    peakBold: { fontWeight: "700", color: COLORS.text },
    chart: { borderRadius: 16, marginLeft: -8 },
    loadingBox: {
        height: 180, justifyContent: "center", alignItems: "center",
    },
    loadingText: { color: "#94A3B8", fontSize: 14 },
    emptyBox: {
        height: 160, justifyContent: "center", alignItems: "center", gap: 10,
    },
    emptyIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: { fontSize: 14, fontWeight: "600", color: "#94A3B8" },
});
