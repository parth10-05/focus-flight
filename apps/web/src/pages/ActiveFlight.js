import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import BlockedSiteTag from "@/components/flight/BlockedSiteTag";
import FooterTelemetryItem from "@/components/flight/FooterTelemetryItem";
import OverlayMetric from "@/components/flight/OverlayMetric";
import StatusDotLabel from "@/components/flight/StatusDotLabel";
import "@/components/flight/activeFlight.css";
import { useDistractionsCount } from "@/hooks/useDistractionsCount";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { subscribeToFlightChanges } from "@/services/flightService";
import { useFlightStore } from "@/store/useFlightStore";
function formatElapsedTime(elapsedMs) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}
export default function ActiveFlight() {
    const { id: flightIdParam } = useParams();
    const navigate = useNavigate();
    const currentFlight = useFlightStore((state) => state.currentFlight);
    const blockedSites = useFlightStore((state) => state.blockedSites);
    const syncWithBackend = useFlightStore((state) => state.syncWithBackend);
    const endFlight = useFlightStore((state) => state.endFlight);
    const [isSyncing, setIsSyncing] = useState(true);
    const [actionError, setActionError] = useState(null);
    const [isEnding, setIsEnding] = useState(null);
    const distractionsCount = useDistractionsCount(flightIdParam ?? currentFlight?.id ?? null);
    const elapsedMs = useElapsedTime(currentFlight?.start_time ?? null);
    useEffect(() => {
        const ensureFlight = async () => {
            if (!currentFlight) {
                await syncWithBackend("");
            }
            setIsSyncing(false);
        };
        void ensureFlight();
    }, [currentFlight, syncWithBackend]);
    useEffect(() => {
        const unsubscribe = subscribeToFlightChanges((flight) => {
            if (flight.status !== "active") {
                return;
            }
            if (flightIdParam && flight.id !== flightIdParam) {
                return;
            }
            useFlightStore.setState({ currentFlight: flight, isActive: true });
        });
        return unsubscribe;
    }, [flightIdParam]);
    const routeLabel = useMemo(() => {
        if (!currentFlight) {
            return "UNKNOWN → UNKNOWN";
        }
        return `${currentFlight.origin.toUpperCase()} → ${currentFlight.destination.toUpperCase()}`;
    }, [currentFlight]);
    const canRenderActiveFlight = currentFlight && currentFlight.status === "active" && (!flightIdParam || currentFlight.id === flightIdParam);
    const handleEndFlight = async (status) => {
        if (!currentFlight) {
            return;
        }
        setIsEnding(status);
        setActionError(null);
        try {
            await endFlight(status);
            navigate(`/debrief/${currentFlight.id}`);
        }
        catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to complete flight action");
        }
        finally {
            setIsEnding(null);
        }
    };
    if (!isSyncing && !canRenderActiveFlight) {
        return _jsx(Navigate, { to: "/logbook", replace: true });
    }
    if (!currentFlight) {
        return _jsx("div", { className: "min-h-screen bg-background" });
    }
    return (_jsxs("div", { className: "active-flight-page font-body selection:bg-primary/30 h-screen flex flex-col bg-[#08090A] text-[#c1c7ce] overflow-hidden", children: [_jsxs("header", { className: "fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 pointer-events-none", children: [_jsx("div", { className: "flex items-center gap-2 pointer-events-auto", children: _jsx("span", { className: "text-xs font-mono tracking-[0.2em] text-secondary", children: "OS_VANGUARD // ALPHA" }) }), _jsxs("div", { className: "absolute left-1/2 -translate-x-1/2 flex flex-col items-center", children: [_jsx("span", { className: "font-mono text-[10px] tracking-[0.3em] text-secondary mb-1", children: "CURRENT TRAJECTORY" }), _jsx("h1", { className: "font-mono text-sm tracking-[0.15em] text-primary bg-surface-container-low/40 px-4 py-1 rounded-sm border border-outline-variant/10", children: routeLabel })] }), _jsxs("div", { className: "pointer-events-auto flex items-center gap-3", children: [_jsx("button", { className: "font-label text-[10px] tracking-widest text-primary/70 border border-primary/30 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 uppercase disabled:opacity-60", onClick: () => void handleEndFlight("completed"), disabled: Boolean(isEnding), children: isEnding === "completed" ? "LANDING" : "LAND" }), _jsx("button", { className: "font-label text-[10px] tracking-widest text-error/60 border border-error/20 px-4 py-2 hover:bg-error/10 hover:text-error transition-all duration-300 uppercase disabled:opacity-60", onClick: () => void handleEndFlight("aborted"), disabled: Boolean(isEnding), children: isEnding === "aborted" ? "ABORTING" : "ABORT PROTOCOL" })] })] }), _jsxs("main", { className: "flex-grow relative flex items-center justify-center p-12", children: [_jsx("div", { className: "absolute inset-0 z-0 opacity-40 grayscale contrast-125", children: _jsxs("div", { className: "w-full h-full bg-[#08090A] relative overflow-hidden", children: [_jsx("img", { alt: "Dark satellite view of earth from extreme altitude", className: "w-full h-full object-cover mix-blend-luminosity opacity-20", "data-alt": "Cinematic dark satellite imagery of earth at night, deep blacks and subtle navy shadows, high-contrast topological details, moody lighting", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-5BQShyOe_dgkd9mj-wmYUVdLH5xmxXh1Wsol_FYQadNonbWIadLPuQ26Zemk6FejnYKYmWxhpP7wYhEl1XyA1Y0OW_x9WXBe_qSTa40wsGvo2PiV2EuCmnkhlOY8unFpz6RWbxpnPcvUZ7uUrtfD2W9bNGl7tGqPmOSaV9rzQPWcVE2x8pOz6yYM-PfyRmwKht3ABo96eaHlQ2k2H8vmY2FGcivqHJ7dMPcY-bVChYY7mxkrZ68E7txqrTlWHYkdDD3gB_U-Znu2" }), _jsxs("svg", { className: "absolute inset-0 w-full h-full z-10", viewBox: "0 0 1000 600", children: [_jsx("path", { className: "route-glow", d: "M 300 450 Q 500 100 800 150", fill: "none", stroke: "#c1c7ce", strokeDasharray: "4 4", strokeWidth: "0.5" }), _jsx("circle", { className: "animate-pulse shadow-lg", cx: "540", cy: "210", fill: "#c1c7ce", r: "3" }), _jsx("path", { d: "M 540 210 L 530 220 L 540 215 L 550 220 Z", fill: "#c1c7ce", transform: "rotate(-45 540 210)" })] })] }) }), _jsxs("div", { className: "relative z-10 flex flex-col items-center", children: [_jsxs("div", { className: "mb-2 flex items-center gap-4", children: [_jsx("span", { className: "h-[1px] w-12 bg-outline-variant/30" }), _jsx("span", { className: "font-label text-[10px] tracking-[0.4em] text-secondary", children: "REMAINING DURATION" }), _jsx("span", { className: "h-[1px] w-12 bg-outline-variant/30" })] }), _jsx("div", { className: "font-mono text-[120px] leading-none tracking-tighter text-primary font-light text-glow", children: formatElapsedTime(elapsedMs) }), _jsxs("div", { className: "mt-4 flex gap-8", children: [_jsx(StatusDotLabel, { label: "Uplink Active", pulsing: true }), _jsx(StatusDotLabel, { label: "Phase: Cruise" })] }), _jsx("div", { className: "mt-6 flex flex-wrap justify-center gap-2 max-w-xl", children: blockedSites.map((site, index) => (_jsx(BlockedSiteTag, { site: site }, `${site}-${index}`))) }), actionError ? _jsx("p", { className: "mt-4 font-mono text-[10px] text-error uppercase tracking-widest", children: actionError }) : null] }), _jsx("div", { className: "absolute bottom-16 left-16 z-20", children: _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-label text-[9px] tracking-[0.2em] text-secondary uppercase", children: "Local Time (DST)" }), _jsxs("p", { className: "font-mono text-lg text-primary", children: ["14:52 ", _jsx("span", { className: "text-xs text-secondary-dim", children: "UTC+1" })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-label text-[9px] tracking-[0.2em] text-secondary uppercase", children: "External Temp" }), _jsxs("p", { className: "font-mono text-lg text-primary", children: ["-56\u00B0C ", _jsx("span", { className: "text-xs text-secondary-dim", children: "ISA-12" })] })] })] }) }), _jsx("div", { className: "absolute bottom-16 right-16 z-20", children: _jsxs("div", { className: "flex flex-col gap-8 items-end", children: [_jsxs("div", { className: "grid grid-cols-2 gap-x-12 gap-y-4", children: [_jsx(OverlayMetric, { label: "Altitude", value: "60,000 FT" }), _jsx(OverlayMetric, { label: "Speed", value: "MACH 2" }), _jsx(OverlayMetric, { label: "Signal", value: "STABLE" }), _jsx(OverlayMetric, { label: "Distractions", value: String(distractionsCount) })] }), _jsx("div", { className: "h-[1px] w-48 bg-gradient-to-l from-primary/40 to-transparent" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "material-symbols-outlined text-secondary text-sm", "data-icon": "radar", children: "radar" }), _jsx("span", { className: "font-mono text-[10px] tracking-[0.2em] text-secondary uppercase", children: "Scanning Airspace" })] })] }) })] }), _jsxs("footer", { className: "fixed bottom-0 w-full z-50 h-10 border-t border-primary/5 bg-background flex justify-around items-center px-12", children: [_jsx(FooterTelemetryItem, { icon: "height", label: "ALT: 60K" }), _jsx(FooterTelemetryItem, { icon: "speed", label: "SPD: MACH 2" }), _jsx(FooterTelemetryItem, { icon: "water_drop", label: "FUEL: 88%" }), _jsx(FooterTelemetryItem, { icon: "radar", label: `SIG: ${distractionsCount > 0 ? "ACTIVE" : "STABLE"}`, active: true })] }), _jsx("div", { className: "fixed inset-0 pointer-events-none z-40 opacity-[0.03]", children: _jsx("div", { className: "w-full h-[2px] bg-primary animate-scan absolute top-0" }) })] }));
}
