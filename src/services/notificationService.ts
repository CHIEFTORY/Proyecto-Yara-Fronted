import { api } from "./api";

export interface NotificationItem {
    id: number;
    mensaje: string;
    tipo: string;

    grupoId?: number;
    grupoNombre?: string;

    fecha: string;
    leido: boolean;
}

export const getNotifications =
    async (): Promise<NotificationItem[]> => {

        const response =
            await api.get(
                "/notificaciones/me?limit=30"
            );

        return response.data;
    };

export const markNotificationAsRead =
    async (notificationId: number) => {

        await api.put(
            `/notificaciones/${notificationId}/leer`
        );
    };

export const markAllNotificationsAsRead =
    async () => {

        await api.put(
            "/notificaciones/me/marcar-todas"
        );
    };

export const getUnreadNotificationsCount =
    async (): Promise<number> => {

        const response =
            await api.get(
                "/notificaciones/me/no-leidas"
            );

        return response.data.total ?? 0;
    };
export interface InvitationItem {

    id: number;

    grupoId: number;

    grupoNombre: string;

    emisorNombre: string;

    estado: string;
}

export const getPendingInvitations =
    async (): Promise<InvitationItem[]> => {

        const response =
            await api.get(
                "/invitaciones/pendientes"
            );

        return response.data;
    };

export const acceptInvitation =
    async (id: number) => {

        await api.post(
            `/invitaciones/${id}/aceptar`
        );
    };

export const rejectInvitation =
    async (id: number) => {

        await api.post(
            `/invitaciones/${id}/rechazar`
        );
    };

export const savePushToken =
    async (token: string) => {

        await api.post(
            "/usuarios/push-token",
            {
                token,
            }
        );
    };
