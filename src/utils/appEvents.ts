import { useEffect } from "react";

export type AppEventType =
    | "activity"
    | "badge"
    | "dashboard"
    | "group"
    | "groups"
    | "payments";

type AppEventListener = (type: AppEventType) => void;

const listeners = new Set<AppEventListener>();

export const emitAppEvent = (...types: AppEventType[]) => {
    const uniqueTypes = Array.from(new Set(types));
    uniqueTypes.forEach((type) => {
        listeners.forEach((listener) => listener(type));
    });
};

export const subscribeAppEvents = (listener: AppEventListener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useAppRefresh = (
    types: AppEventType[],
    callback: () => void | Promise<void>
) => {
    const typeKey = types.join("|");

    useEffect(() => {
        const typeSet = new Set(typeKey.split("|") as AppEventType[]);
        const unsubscribe = subscribeAppEvents((type) => {
            if (typeSet.has(type)) {
                void callback();
            }
        });

        return unsubscribe;
    }, [callback, typeKey]);
};
