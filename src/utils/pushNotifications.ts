import * as Device
    from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";
import { emitAppEvent } from "@/src/utils/appEvents";

export const registerForPushNotifications =
    async () => {

        if (!Device.isDevice) {
            return null;
        }

        if (Constants.appOwnership === "expo") {
            console.log(
                "Push remoto omitido: Expo Go en Android ya no soporta expo-notifications. Usa development build."
            );
            return null;
        }

        const Notifications =
            await import("expo-notifications");

        const { status: existingStatus } =

            await Notifications
                .getPermissionsAsync();

        let finalStatus =
            existingStatus;

        if (
            existingStatus !== "granted"
        ) {

            const { status } =

                await Notifications
                    .requestPermissionsAsync();

            finalStatus = status;
        }

        if (
            finalStatus !== "granted"
        ) {

            return null;
        }

        const token =
            (
                await Notifications
                    .getExpoPushTokenAsync()
            ).data;

        return token;
    };

export const setupPushNotificationNavigation = () => {
    if (Constants.appOwnership === "expo") {
        return () => {};
    }

    let responseSubscription: { remove: () => void } | null = null;
    let receivedSubscription: { remove: () => void } | null = null;
    let mounted = true;

    const setup = async () => {
        try {
            const Notifications =
                await import("expo-notifications");

            Notifications.setNotificationHandler({
                handleNotification: async () => ({
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

            const lastResponse =
                await Notifications.getLastNotificationResponseAsync();

            const route =
                lastResponse?.notification.request.content.data?.route;

            if (mounted && typeof route === "string") {
                router.push(route as any);
            }
        } catch (error) {
            console.log(error);
        }
    };

    setup();

    return () => {
        mounted = false;
        responseSubscription?.remove();
        receivedSubscription?.remove();
    };
};
