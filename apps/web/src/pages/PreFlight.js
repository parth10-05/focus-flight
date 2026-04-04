import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlockedSectorChip from "@/components/preflight/BlockedSectorChip";
import FooterMetric from "@/components/preflight/FooterMetric";
import TelemetryTile from "@/components/preflight/TelemetryTile";
import "@/components/preflight/preflight.css";
import { getActiveFlight } from "@/services/flightService";
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
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(120);
    const [blockedSites, setBlockedSites] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const durationDisplay = useMemo(() => Math.max(1, Math.round(durationMinutes)), [durationMinutes]);
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
    const validate = () => {
        const nextErrors = {};
        if (!origin.trim()) {
            nextErrors.origin = "Departure Vector is required";
        }
        if (!destination.trim()) {
            nextErrors.destination = "Arrival Destination is required";
        }
        if (!durationDisplay || durationDisplay <= 0) {
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
        setIsSubmitting(true);
        setErrors({});
        try {
            const flight = await startFlight({
                origin: origin.trim(),
                destination: destination.trim(),
                duration: durationDisplay * 60,
                blockedSites
            });
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
    return (_jsxs("div", { className: "preflight-page text-on-background overflow-x-hidden", children: [_jsx("main", { className: "px-12 py-10 min-h-screen", children: _jsxs("div", { className: "max-w-4xl mx-auto flex flex-col items-center", children: [_jsxs("header", { className: "text-center mb-16", children: [_jsx("h1", { className: "text-5xl font-light tracking-[0.2em] text-primary uppercase mb-4", children: "Plan Your Flight" }), _jsx("div", { className: "h-[1px] w-24 bg-outline-variant/30 mx-auto mb-4" }), _jsx("p", { className: "text-secondary font-light tracking-[0.1em] text-xs uppercase", children: "Configuration for Stratospheric Silence session" })] }), _jsxs("form", { className: "w-full grid grid-cols-12 gap-8", onSubmit: handleSubmit, children: [_jsxs("section", { className: "col-span-12 bg-surface-container-low p-10 border-l border-primary/20 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 p-4 font-mono text-[10px] text-primary/20 tracking-tighter", children: "COORD_SYS: ST-04" }), _jsxs("div", { className: "grid grid-cols-2 gap-12", children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "group", children: [_jsx("label", { className: "block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-2", children: "Departure Vector" }), _jsx("input", { className: `w-full bg-transparent border-b-2 ${errors.origin ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`, placeholder: "FOCUS_HUB_ALPHA", type: "text", value: origin, onChange: (event) => setOrigin(event.target.value) }), errors.origin ? _jsx("p", { className: "mt-2 font-mono text-[10px] text-error", children: errors.origin }) : null] }), _jsxs("div", { className: "group", children: [_jsx("label", { className: "block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-2", children: "Arrival Destination" }), _jsx("input", { className: `w-full bg-transparent border-b-2 ${errors.destination ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`, placeholder: "DEEP_WORK_EPSILON", type: "text", value: destination, onChange: (event) => setDestination(event.target.value) }), errors.destination ? _jsx("p", { className: "mt-2 font-mono text-[10px] text-error", children: errors.destination }) : null] })] }), _jsxs("div", { className: "flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-label text-[10px] text-secondary tracking-[0.15em] uppercase mb-4", children: "Flight Duration (MIN)" }), _jsxs("div", { className: "flex items-end gap-4 mb-2", children: [_jsx("span", { className: "font-mono text-4xl text-primary font-light", children: durationDisplay }), _jsx("span", { className: "font-mono text-xs text-secondary pb-1", children: "T-MINUS" })] }), _jsx("input", { className: `preflight-duration-slider w-full appearance-none bg-transparent cursor-pointer ${errors.duration ? "[&::-webkit-slider-runnable-track]:bg-[#ee7d77]" : ""}`, max: 240, min: 15, type: "range", value: durationDisplay, onChange: (event) => setDurationMinutes(Number(event.target.value)) }), errors.duration ? _jsx("p", { className: "mt-2 font-mono text-[10px] text-error", children: errors.duration }) : null] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-8", children: [_jsx(TelemetryTile, { label: "Ox Level", value: "98.2%" }), _jsx(TelemetryTile, { label: "Signal", value: "LOCKED" })] })] })] })] }), _jsxs("section", { className: "col-span-12 grid grid-cols-3 gap-6", children: [_jsx("div", { className: "col-span-2 bg-surface-container-low p-6 flex flex-col justify-between", children: _jsxs("div", { children: [_jsxs("h3", { className: "font-label text-xs tracking-[0.2em] text-primary uppercase mb-6 flex items-center gap-2", children: [_jsx("span", { className: "material-symbols-outlined text-sm", children: "security" }), "Blocked Sectors"] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [blockedSites.map((domain, index) => (_jsx(BlockedSectorChip, { label: domain, onRemove: () => removeBlockedDomain(index) }, `${domain}-${index}`))), _jsx("button", { className: "px-3 py-1 border border-primary/40 border-dashed hover:border-primary transition-colors", type: "button", onClick: addBlockedDomain, children: _jsx("span", { className: "material-symbols-outlined text-[10px] text-primary", children: "add" }) })] })] }) }), _jsxs("button", { className: "col-span-1 bg-primary p-6 flex flex-col justify-between items-start text-on-primary group cursor-pointer hover:bg-tertiary transition-colors text-left disabled:opacity-70 disabled:cursor-not-allowed", type: "submit", disabled: isSubmitting, children: [_jsx("span", { className: "material-symbols-outlined text-3xl font-light", children: "rocket_launch" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold tracking-[0.2em] text-xs uppercase", children: isSubmitting ? "Starting Flight" : "Commit Flight" }), _jsx("div", { className: "font-mono text-[9px] opacity-70", children: isSubmitting ? "EXECUTING..." : "EXECUTE_SILENCE_PROTOCOL" })] })] })] }), errors.submit ? _jsx("p", { className: "col-span-12 font-mono text-[10px] text-error", children: errors.submit }) : null, _jsxs("div", { className: "col-span-12 h-64 mt-8 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-surface-dim to-transparent z-10" }), _jsx("img", { className: "w-full h-full object-cover grayscale opacity-30", "data-alt": "dramatic view of earth from space with atmospheric glow and dark void background", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWRmpU9-eZWovurdOYwh-15AqLGmmYTnB-FTBF0oSHw8y3Y-cQ28fcNhb12nNFtfoaQYZT0wA9kL4q0CFQpXzwkKxml6W5xUnAfeAY97oNHQF6y-U9e-ukRpxFj_6G9buaej1wKDjEYiGzQLHinmE8251_UtEMDxF-NOw9WqCqN2NianHc_IewdVZ1Nkk59KzTqsJySUMSCV5FLrNzNQDoaAkdQgTX5DjW7LxiLmTBL72EzcvTCEUlg5bkqZ93xtuGQXIOJfUvWYPx" }), _jsxs("div", { className: "absolute bottom-8 left-8 z-20 space-y-1", children: [_jsx("div", { className: "font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase", children: "Current Visibility: Absolute" }), _jsx("div", { className: "font-mono text-[10px] text-primary/40 tracking-[0.3em] uppercase", children: "Sector: 00-VOID" })] })] })] })] }) }), _jsxs("footer", { className: "p-8 border-t border-outline-variant/10 flex justify-between items-center", children: [_jsxs("div", { className: "flex gap-12", children: [_jsx(FooterMetric, { label: "System Status", value: "Nominal", withPulse: true }), _jsx(FooterMetric, { label: "Neural Load", value: "0.04 MS" })] }), _jsx("div", { className: "font-mono text-[9px] text-secondary/40", children: "\u00A9 2024 AEROFOCUS TECHNOLOGY SYSTEMS" })] })] }));
}
