import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    BarChart,
} from "react-native-chart-kit";

import {
    COLORS,
} from "@/src/styles/colors";

import {
    getExpenseChart,
} from "@/src/services/expenseService";

const screenWidth =
    Dimensions.get("window").width;

export default function ExpenseChart() {

    const [chartData, setChartData] =
        useState<
            {
                mes: string;
                total: number;
            }[]
        >([]);

    useEffect(() => {

        loadChart();

    }, []);

    const loadChart = async () => {

        try {

            const data =
                await getExpenseChart();

            setChartData(data);

        } catch (error) {

            console.log(error);
        }
    };

    return (

        <View style={styles.card}>

            <Text style={styles.title}>
                Gastos mensuales
            </Text>

            <BarChart
                data={{
                    labels:
                        chartData.map(
                            item => item.mes
                        ),

                    datasets: [
                        {
                            data:
                                chartData.map(
                                    item =>
                                        item.total || 0
                                ),
                        }
                    ],
                }}

                width={screenWidth - 80}

                height={240}

                yAxisLabel="S/ "

                yAxisSuffix=""

                fromZero

                showValuesOnTopOfBars={false}

                chartConfig={{
                    backgroundGradientFrom:
                    COLORS.white,

                    backgroundGradientTo:
                    COLORS.white,

                    decimalPlaces: 0,

                    color: (opacity = 1) =>
                        `rgba(37, 99, 235, ${opacity})`,

                    labelColor: () =>
                        COLORS.subtitle,

                    barPercentage: 0.7,

                    propsForBackgroundLines: {
                        stroke: "#E5E7EB",
                    },
                }}

                style={styles.chart}
            />

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: COLORS.white,

        borderRadius: 24,

        padding: 22,

        marginBottom: 24,

        shadowColor: "#000",

        shadowOpacity: 0.04,

        shadowRadius: 8,

        elevation: 2,
    },

    title: {
        fontSize: 22,

        fontWeight: "bold",

        color: COLORS.text,

        marginBottom: 20,
    },

    chart: {
        borderRadius: 18,
    },
});