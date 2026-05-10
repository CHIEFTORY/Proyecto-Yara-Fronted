export const formatTimeAgo = (
    dateString: string
) => {

    const now = new Date();

    const date =
        new Date(dateString);

    const seconds =
        Math.floor(
            (now.getTime() - date.getTime())
            / 1000
        );

    if (seconds < 60) {
        return "Hace unos segundos";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `Hace ${minutes} min`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `Hace ${hours} h`;
    }

    const days =
        Math.floor(hours / 24);

    if (days === 1) {
        return "Ayer";
    }

    return `Hace ${days} días`;
};