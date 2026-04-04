import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { DURATION_FILTERS, formatDuration, PRESET_ROUTES, REGIONS } from "@/data/flightRoutes";
export function RouteSelector({ onSelect, selectedId }) {
    const [activeRegion, setActiveRegion] = useState("all");
    const [activeDuration, setActiveDuration] = useState("all");
    const matchesDuration = (route) => {
        if (activeDuration === "all") {
            return true;
        }
        if (activeDuration === "short") {
            return route.durationMinutes <= 180;
        }
        if (activeDuration === "medium") {
            return route.durationMinutes > 180 && route.durationMinutes <= 480;
        }
        if (activeDuration === "long") {
            return route.durationMinutes > 480 && route.durationMinutes <= 780;
        }
        return route.durationMinutes > 780;
    };
    const filteredRoutes = useMemo(() => PRESET_ROUTES.filter((route) => {
        const regionMatch = activeRegion === "all" || route.region === activeRegion;
        return regionMatch && matchesDuration(route);
    }), [activeDuration, activeRegion]);
    return (_jsxs("div", { children: [_jsx("div", { style: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }, children: REGIONS.map((region) => (_jsx("button", { type: "button", onClick: () => setActiveRegion(region.id), style: {
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-small)",
                        border: "none",
                        cursor: "pointer",
                        background: activeRegion === region.id ? "var(--color-accent-blue)" : "var(--color-elevated)",
                        color: activeRegion === region.id ? "var(--color-base)" : "var(--color-text-muted)"
                    }, children: region.label }, region.id))) }), _jsx("div", { style: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }, children: DURATION_FILTERS.map((duration) => (_jsx("button", { type: "button", onClick: () => setActiveDuration(duration.id), style: {
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-small)",
                        border: "none",
                        cursor: "pointer",
                        background: activeDuration === duration.id ? "var(--color-accent-green)" : "var(--color-elevated)",
                        color: activeDuration === duration.id ? "var(--color-base)" : "var(--color-text-muted)"
                    }, children: duration.label }, duration.id))) }), _jsx("div", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "12px",
                    maxHeight: "320px",
                    overflowY: "auto",
                    paddingRight: "4px"
                }, children: filteredRoutes.map((route) => (_jsxs("button", { type: "button", onClick: () => onSelect(route), style: {
                        background: selectedId === route.id ? "var(--color-elevated)" : "var(--color-surface)",
                        border: selectedId === route.id ? "1px solid var(--color-accent-blue)" : "1px solid transparent",
                        borderRadius: "var(--radius-standard)",
                        padding: "12px",
                        cursor: "pointer",
                        textAlign: "left"
                    }, children: [_jsxs("div", { style: {
                                fontFamily: "var(--font-mono)",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "var(--color-text-primary)",
                                letterSpacing: "0.08em",
                                marginBottom: "4px"
                            }, children: [route.origin, " ", " -> ", " ", route.destination] }), _jsxs("div", { style: {
                                fontFamily: "var(--font-sans)",
                                fontSize: "11px",
                                color: "var(--color-text-secondary)",
                                marginBottom: "8px",
                                lineHeight: 1.3
                            }, children: [route.originCity, " ", " -> ", " ", route.destinationCity] }), _jsx("div", { style: {
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--color-accent-green)",
                                letterSpacing: "0.06em"
                            }, children: formatDuration(route.durationMinutes) }), _jsxs("div", { style: {
                                fontFamily: "var(--font-mono)",
                                fontSize: "10px",
                                color: "var(--color-text-muted)",
                                marginTop: "4px",
                                letterSpacing: "0.06em"
                            }, children: [route.aircraft, " - ", route.distanceKm.toLocaleString(), "KM"] })] }, route.id))) })] }));
}
