import * as Device
    from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { router } from "expo-router";
import { emitAppEvent } from "@/src/utils/appEvents";

const configureAndroidNotificationChannels =
    (Notifications: typeof import("expo-notifications")) => {

        if (Platform.OS !== "android") {
            return Promise.resolve();
        }

        const channels = [
            {
                id: "pagos",
                name: "Pagos",
                description: "Pagos por confirmar, recibos y deudas pendientes.",
            },
            {
                id: "grupos",
                name: "Grupos",
                description: "Invitaciones y cambios importantes en tus grupos.",
            },
            {
                id: "actividad",
                name: "Actividad",
                description: "Movimientos y recordatorios generales de Yara.",
            },
        ];

        return Promise.all(
            channels.map((channel) =>
                Notifications.setNotificationChannelAsync(channel.id, {
                    name: channel.name,
                    description: channel.description,
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 160, 250],
                    lightColor: "#2563EB",
                    sound: "default",
                })
            )
        ).then(() => undefined);
    };

export const registerForPushNotifications =
    () => {

        if (!Device.isDevice) {
            return Promise.resolve(null);
        }

        if (Constants.appOwnership === "expo") {
            console.log(
                "Push remoto omitido: Expo Go en Android ya no soporta expo-notifications. Usa development build."
            );
            return Promise.resolve(null);
        }

        return import("expo-notifications")
            .then((Notifications) =>
                configureAndroidNotificationChannels(Notifications)
                    .then(() => Notifications.getPermissionsAsync())
                    .then(({ status: existingStatus }) => {
                        if (existingStatus === "granted") {
                            return Promise.resolve("granted");
                        }

                        return Notifications
                            .requestPermissionsAsync()
                            .then(({ status }) => status);
                    })
                    .then((finalStatus: string) => {
                        if (finalStatus !== "granted") {
                            return null;
                        }

                        return Notifications
                            .getExpoPushTokenAsync()
                            .then((token) => token.data);
                    })
            );
    };

export const setupPushNotificationNavigation = () => {
    if (Constants.appOwnership === "expo") {
        return () => {};
    }

    let responseSubscription: { remove: () => void } | null = null;
    let receivedSubscription: { remove: () => void } | null = null;
    let mounted = true;

    const setup = () => {
        import("expo-notifications")
            .then((Notifications) =>
                configureAndroidNotificationChannels(Notifications)
                    .then(() => {

                        Notifications.setNotificationHandler({
                            handleNotification: () => Promise.resolve({
                                shouldPlaySound: true,
                                shouldSetBadge: false,
                                shouldShowBanner: true,
                                shouldShowList: true,
                            }),
                        });

                        receivedSubscription =
                            Notifications.addNotificationReceivedListener(() => {
                                emitAppEvent(
                                    "activity",
                                    "badge",
                                    "dashboard",
                                    "group",
                                    "groups",
                                    "payments"
                                );
                            });

                        responseSubscription =
                            Notifications.addNotificationResponseReceivedListener((response) => {
                                const data =
                                    response.notification.request.content.data as {
                                        route?: string;
                                    };

                                if (!mounted || !data?.route) return;

                                emitAppEvent("activity", "badge", "dashboard", "payments", "group", "groups");
                                router.push(data.route as any);
                            });

                        return Notifications.getLastNotificationResponseAsync();
                    })
                    .then((lastResponse) => {

                        const route =
                            lastResponse?.notification.request.content.data?.route;

                        if (mounted && typeof route === "string") {
                            router.push(route as any);
                        }
                    })
            )
            .catch(console.log);
    };

    setup();

    return () => {
        mounted = false;
        responseSubscription?.remove();
        receivedSubscription?.remove();
    };
};
