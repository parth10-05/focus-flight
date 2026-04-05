import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { DURATION_FILTERS, formatDuration, PRESET_ROUTES, REGIONS } from "@/data/flightRoutes";
export function RouteSelector({ onSelect, selectedId }) {
    const [activeRegion, setActiveRegion] = useState("all");
    const [activeDuration, setActiveDuration] = useState("all");
    const toCoordinate = (code, axis) => {
        const hash = code
            .split("")
            .reduce((accumulator, char, index) => accumulator + char.charCodeAt(0) * (index + 11), 0);
        const max = axis === "lat" ? 180 : 360;
        const shifted = ((hash % max) + max) % max;
        const signed = axis === "lat" ? shifted - 90 : shifted - 180;
        const absolute = Math.abs(signed).toFixed(4);
        if (axis === "lat") {
            return `${absolute} deg ${signed >= 0 ? "N" : "S"}`;
        }
        return `${absolute} deg ${signed >= 0 ? "E" : "W"}`;
    };
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
    return (_jsxs("div", { className: "preflight-route-selector", children: [_jsx("div", { className: "preflight-route-filters mb-4", children: REGIONS.map((region) => (_jsx("button", { type: "button", onClick: () => setActiveRegion(region.id), className: `preflight-chip ${activeRegion === region.id ? "is-active" : ""}`, children: region.label }, region.id))) }), _jsx("div", { className: "preflight-route-filters mb-5", children: DURATION_FILTERS.map((duration) => (_jsx("button", { type: "button", onClick: () => setActiveDuration(duration.id), className: `preflight-chip preflight-chip-alt ${activeDuration === duration.id ? "is-active" : ""}`, children: duration.label }, duration.id))) }), _jsx("div", { className: "preflight-route-grid", children: filteredRoutes.map((route) => (_jsxs("button", { type: "button", onClick: () => onSelect(route), className: `preflight-route-card ${selectedId === route.id ? "is-selected" : ""}`, children: [_jsx("div", { className: "preflight-route-code", children: route.id }), _jsxs("div", { className: "preflight-route-top-row", children: [_jsxs("div", { children: [_jsx("div", { className: "preflight-route-leg-label", children: "DEPARTURE" }), _jsx("div", { className: "preflight-route-iata", children: route.origin }), _jsxs("div", { className: "preflight-route-coords", children: [toCoordinate(route.origin, "lat"), ", ", toCoordinate(route.origin, "lng")] })] }), _jsxs("div", { className: "preflight-route-arrow", children: [_jsx("div", { className: "preflight-route-arrow-line" }), _jsx("span", { className: "material-symbols-outlined", children: "flight_takeoff" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "preflight-route-leg-label", children: "ARRIVAL" }), _jsx("div", { className: "preflight-route-iata", children: route.destination }), _jsxs("div", { className: "preflight-route-coords", children: [toCoordinate(route.destination, "lat"), ", ", toCoordinate(route.destination, "lng")] })] })] }), _jsxs("div", { className: "preflight-route-bottom-row", children: [_jsxs("div", { children: [_jsx("div", { className: "preflight-route-leg-label", children: "MISSION DURATION" }), _jsx("div", { className: "preflight-route-duration", children: formatDuration(route.durationMinutes) })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "preflight-route-leg-label", children: "AIRCRAFT" }), _jsx("div", { className: "preflight-route-aircraft", children: route.aircraft }), _jsxs("div", { className: "preflight-route-distance", children: [route.distanceKm.toLocaleString(), "KM"] })] })] }), _jsxs("div", { className: "preflight-route-city-line", children: [route.originCity, " ", " -> ", " ", route.destinationCity] })] }, route.id))) })] }));
}
