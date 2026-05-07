import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native";

import { BarChart } from "react-native-chart-kit";

import { COLORS } from "@/src/styles/colors";

const screenWidth = Dimensions.get("window").width;

export default function ExpenseChart() {

    return (

        <View style={styles.card}>

            <Text style={styles.title}>
                Gastos mensuales
            </Text>

            <BarChart
                data={{
                    labels: ["Ene", "Feb", "Mar", "Abr", "May"],
                    datasets: [
                        {
                            data: [450, 680, 520, 910, 720],
                        }
                    ],
                }}
                width={screenWidth - 80}
                height={240}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                showValuesOnTopOfBars={false}
                chartConfig={{
                    backgroundGradientFrom: COLORS.white,
                    backgroundGradientTo: COLORS.white,

                    decimalPlaces: 0,

                    color: (opacity = 1) =>
                        `rgba(37, 99, 235, ${opacity})`,

                    labelColor: () => COLORS.subtitle,

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