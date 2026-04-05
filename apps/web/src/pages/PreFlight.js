import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlockedSectorChip from "@/components/preflight/BlockedSectorChip";
import FooterMetric from "@/components/preflight/FooterMetric";
import { RouteSelector } from "@/components/preflight/RouteSelector";
import TelemetryTile from "@/components/preflight/TelemetryTile";
import { PRESET_ROUTES } from "@/data/flightRoutes";
import "@/components/preflight/preflight.css";
import { getActiveFlight } from "@/services/flightService";
import { getUserProfile, saveLastBlockedSites } from "@/services/userProfileService";
import { useFlightStore } from "@/store/useFlightStore";
export default function PreFlight() {
    const navigate = useNavigate();
    const startFlight = useFlightStore((state) => state.startFlight);
    useEffect(() => {
        const redirectIfActiveFlightExists = async () => {
            const activeFlight = await getActiveFlight();
            if (activeFlight?.id) {
                navigate(`/flight/${activeFlight.id}`, { replace: true });
            }
        };
        void redirectIfActiveFlightExists();
    }, [navigate]);
    useEffect(() => {
        const preloadBlockedSites = async () => {
            try {
                const profile = await getUserProfile();
                if (!profile?.last_blocked_sites?.length) {
                    return;
                }
                setBlockedSites((current) => (current.length > 0 ? current : profile.last_blocked_sites));
            }
            catch {
                // no-op: preflight should still be usable even if profile defaults fail to load
            }
        };
        void preloadBlockedSites();
    }, []);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(null);
    const [blockedSites, setBlockedSites] = useState([]);
    const [mode, setMode] = useState("custom");
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const durationDisplay = useMemo(() => {
        if (durationMinutes === null) {
            return null;
        }
        return Math.max(1, Math.round(durationMinutes));
    }, [durationMinutes]);
    const selectedRoute = useMemo(() => PRESET_ROUTES.find((route) => route.id === selectedRouteId) ?? null, [selectedRouteId]);
    const addBlockedDomain = () => {
        const nextDomain = window.prompt("Enter domain to block");
        if (!nextDomain) {
            return;
        }
        const normalized = nextDomain.trim();
        if (!normalized) {
            return;
        }
        setBlockedSites((prev) => [...prev, normalized]);
    };
    const removeBlockedDomain = (indexToRemove) => {
        setBlockedSites((prev) => prev.filter((_, index) => index !== indexToRemove));
    };
    const handleRouteSelect = (route) => {
        setSelectedRouteId(route.id);
        setOrigin(route.origin);
        setDestination(route.destination);
        setDurationMinutes(route.durationMinutes);
    };
    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        if (newMode === "custom") {
            setSelectedRouteId(null);
            setOrigin("");
            setDestination("");
            setDurationMinutes(null);
        }
    };
    const validate = () => {
        const nextErrors = {};
        if (!origin.trim()) {
            nextErrors.origin = "Departure Vector is required";
        }
        if (!destination.trim()) {
            nextErrors.destination = "Arrival Destination is required";
        }
        if (durationMinutes === null || durationMinutes <= 0) {
            nextErrors.duration = "Flight Duration is required";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) {
            return;
        }
        if (durationDisplay === null) {
            setErrors({ duration: "Flight Duration is required" });
            return;
        }
        setIsSubmitting(true);
        setErrors({});
        try {
            const flight = await startFlight({
                origin: origin.trim(),
                destination: destination.trim(),
                duration: durationDisplay * 60,
                blockedSites,
                aircraftType: selectedRoute?.aircraft,
                distanceKm: selectedRoute?.distanceKm
            });
            await saveLastBlockedSites(blockedSites);
            navigate(`/flight/${flight.id}`);
        }
        catch (error) {
            if (error instanceof Error && error.message.startsWith("ACTIVE_FLIGHT_EXISTS:")) {
                const [, activeFlightId] = error.message.split(":");
                if (activeFlightId) {
                    navigate(`/flight/${activeFlightId}`, { replace: true });
                    return;
                }
            }
            setErrors({
                submit: error instanceof Error ? error.message : "Failed to start flight"
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "preflight-page text-on-background overflow-x-hidden", children: _jsx("main", { className: "preflight-main px-6 md:px-12 py-8 md:py-10 min-h-screen", children: _jsx("div", { className: "mx-auto w-full max-w-7xl", children: _jsxs("form", { className: "w-full", onSubmit: handleSubmit, children: [_jsx("header", { className: "mb-12 md:mb-14", children: _jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-light text-4xl md:text-5xl tracking-[0.15em] text-on-surface uppercase", children: "Mission Vectors" }), _jsx("p", { className: "font-mono text-[11px] text-on-surface-variant mt-2 tracking-[0.14em] uppercase", children: "STRATOS_SURVEILLANCE_SYSTEM // PRESET_ARCHIVE_09" })] }), _jsxs("div", { className: "preflight-mode-tabs", children: [_jsx("button", { type: "button", className: `preflight-mode-tab ${mode === "preset" ? "is-active" : ""}`, onClick: () => handleModeSwitch("preset"), children: "PRESET VECTORS" }), _jsx("button", { type: "button", className: `preflight-mode-tab ${mode === "custom" ? "is-active" : ""}`, onClick: () => handleModeSwitch("custom"), children: "CUSTOM MISSION" })] })] }) }), _jsxs("section", { className: "preflight-panel preflight-panel-main", children: [_jsx("div", { className: "preflight-panel-code", children: "COORD_SYS: ST-04" }), mode === "preset" ? (_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "preflight-panel-label mb-3", children: "SELECT ROUTE // AUTO-FILLS MISSION PARAMETERS" }), _jsx(RouteSelector, { onSelect: handleRouteSelect, selectedId: selectedRouteId })] })) : null, _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12", children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("label", { className: "preflight-field-label", children: "Departure Vector" }), _jsx("input", { className: `preflight-text-input ${errors.origin ? "is-error" : ""}`, placeholder: "FOCUS_HUB_ALPHA", type: "text", value: origin, onChange: (event) => setOrigin(event.target.value) }), errors.origin ? _jsx("p", { className: "preflight-field-error", children: errors.origin }) : null] }), _jsxs("div", { children: [_jsx("label", { className: "preflight-field-label", children: "Arrival Destination" }), _jsx("input", { className: `preflight-text-input ${errors.destination ? "is-error" : ""}`, placeholder: "DEEP_WORK_EPSILON", type: "text", value: destination, onChange: (event) => setDestination(event.target.value) }), errors.destination ? _jsx("p", { className: "preflight-field-error", children: errors.destination }) : null] })] }), _jsxs("div", { className: "flex flex-col justify-between gap-8", children: [_jsxs("div", { children: [_jsx("label", { className: "preflight-field-label", children: "Flight Duration (MIN)" }), _jsxs("div", { className: "flex items-end gap-4 mb-2", children: [_jsx("span", { className: "font-mono text-4xl text-on-surface font-light", children: durationDisplay ?? "--" }), _jsx("span", { className: "font-mono text-xs text-on-surface-variant pb-1 tracking-[0.1em]", children: "T-MINUS" })] }), _jsx("input", { className: `preflight-duration-slider w-full appearance-none bg-transparent cursor-pointer ${errors.duration ? "[&::-webkit-slider-runnable-track]:bg-[#ee7d77]" : ""}`, max: 240, min: 15, type: "range", value: durationDisplay ?? 15, onChange: (event) => setDurationMinutes(Number(event.target.value)) }), errors.duration ? _jsx("p", { className: "preflight-field-error", children: errors.duration }) : null] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(TelemetryTile, { label: "Ox Level", value: "98.2%" }), _jsx(TelemetryTile, { label: "Signal", value: "LOCKED" })] })] })] })] }), _jsxs("section", { className: "mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 preflight-panel", children: [_jsxs("h3", { className: "font-label text-[11px] tracking-[0.2em] text-on-surface uppercase mb-5 flex items-center gap-2", children: [_jsx("span", { className: "material-symbols-outlined text-base", children: "security" }), "Blocked Sectors"] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [blockedSites.map((domain, index) => (_jsx(BlockedSectorChip, { label: domain, onRemove: () => removeBlockedDomain(index) }, `${domain}-${index}`))), _jsxs("button", { className: "preflight-add-domain", type: "button", onClick: addBlockedDomain, children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "add" }), "ADD DOMAIN"] })] })] }), _jsxs("button", { className: "preflight-submit-btn", type: "submit", disabled: isSubmitting, children: [_jsx("span", { className: "material-symbols-outlined text-3xl font-light", children: "rocket_launch" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.2em] font-bold", children: isSubmitting ? "Starting Flight" : "Initiate Vector" }), _jsx("div", { className: "font-mono text-[10px] opacity-70 tracking-[0.08em]", children: isSubmitting ? "EXECUTING..." : "EXECUTE_SILENCE_PROTOCOL" })] })] })] }), errors.submit ? _jsx("p", { className: "mt-4 font-mono text-[10px] text-error", children: errors.submit }) : null, _jsxs("footer", { className: "mt-12 preflight-footer-overlay", children: [_jsxs("div", { className: "flex flex-wrap gap-x-12 gap-y-5", children: [_jsx(FooterMetric, { label: "Vectors Cached", value: PRESET_ROUTES.length.toLocaleString() }), _jsx(FooterMetric, { label: "Active Fleet", value: "84" }), _jsx(FooterMetric, { label: "System Status", value: "Stable", withPulse: true })] }), _jsxs("div", { className: "flex items-center gap-5", children: [_jsx("span", { className: "font-mono text-[11px] text-on-surface-variant uppercase tracking-[0.12em]", children: "Last sync: 04:20:11 UTC" }), _jsx("button", { className: "preflight-refresh-btn", type: "button", children: "REFRESH ARCHIVE" })] })] })] }) }) }) }));
}
