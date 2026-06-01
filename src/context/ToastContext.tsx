import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

type ToastOptions = {
    title: string;
    message?: string;
    type?: ToastType;
};

type ToastContextValue = {
    showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_META: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    success: { icon: "checkmark-circle-outline", color: "#15803D", bg: "#ECFDF5" },
    error: { icon: "alert-circle-outline", color: "#DC2626", bg: "#FEF2F2" },
    info: { icon: "information-circle-outline", color: "#2563EB", bg: "#EFF6FF" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => setToast(null));
    }, [opacity, translateY]);

    const showToast = useCallback((options: ToastOptions) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setToast(options);
        opacity.setValue(0);
        translateY.setValue(-20);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                damping: 16,
                stiffness: 180,
                useNativeDriver: true,
            }),
        ]).start();

        timerRef.current = setTimeout(hideToast, 2600);
    }, [hideToast, opacity, translateY]);

    const type = toast?.type || "info";
    const meta = TOAST_META[type];

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.toast,
                        {
                            opacity,
                            transform: [{ translateY }],
                            backgroundColor: meta.bg,
                            borderColor: meta.color,
                        },
                    ]}
                >
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                    <View style={styles.toastTextBox}>
                        <Text style={[styles.toastTitle, { color: meta.color }]}>
                            {toast.title}
                        </Text>
                        {toast.message ? (
                            <Text style={styles.toastMessage}>{toast.message}</Text>
                        ) : null}
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return context;
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        left: 18,
        right: 18,
        top: 58,
        zIndex: 999,
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        shadowColor: "#0F172A",
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 8,
    },
    toastTextBox: {
        flex: 1,
    },
    toastTitle: {
        fontSize: 14,
        fontWeight: "900",
    },
    toastMessage: {
        marginTop: 2,
        color: "#475569",
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 17,
    },
});
