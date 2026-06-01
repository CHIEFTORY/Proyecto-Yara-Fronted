import { useEffect, useState } from "react";

export function useRelativeTimeTick(intervalMs = 15000) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs]);

    return now;
}
