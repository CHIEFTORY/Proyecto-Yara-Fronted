export const getReadableType = (
    type: string
) => {

    const normalizedType =
        type?.trim().toUpperCase();

    if (normalizedType === "PAGO") {
        return "Pago realizado";
    }

    if (normalizedType === "GASTO") {
        return "Nuevo gasto";
    }

    if (normalizedType === "EDIT") {
        return "Gasto actualizado";
    }

    if (normalizedType === "DELETE") {
        return "Elemento eliminado";
    }
    if (normalizedType === "PAGO_CONFIRMADO") {
        return "Pago confirmado";
    }
    if (normalizedType === "PAGO_PENDIENTE") {
        return "Pago pendiente";
    }
    if (normalizedType === "PAGO_RECHAZADO") {
        return "Pago no recibido";
    }
    if (normalizedType === "INVITACION") {
        return "Invitación";
    }
    if (normalizedType === "JOIN") {
        return "Se unió al grupo";
    }

    return "Notificación";
};
