import { useMemo, useState } from "react";

import {
  DURATION_FILTERS,
  type DurationFilterId,
  type PresetRoute,
  formatDuration,
  PRESET_ROUTES,
  REGIONS
} from "@/data/flightRoutes";

interface RouteSelectorProps {
  onSelect: (route: PresetRoute) => void;
  selectedId: string | null;
}

export function RouteSelector({ onSelect, selectedId }: RouteSelectorProps): JSX.Element {
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [activeDuration, setActiveDuration] = useState<DurationFilterId>("all");

  const matchesDuration = (route: PresetRoute): boolean => {
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

  const filteredRoutes = useMemo(
    () =>
      PRESET_ROUTES.filter((route) => {
        const regionMatch = activeRegion === "all" || route.region === activeRegion;
        return regionMatch && matchesDuration(route);
      }),
    [activeDuration, activeRegion]
  );

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => setActiveRegion(region.id)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              padding: "4px 10px",
              borderRadius: "var(--radius-small)",
              border: "none",
              cursor: "pointer",
              background: activeRegion === region.id ? "var(--color-accent-blue)" : "var(--color-elevated)",
              color: activeRegion === region.id ? "var(--color-base)" : "var(--color-text-muted)"
            }}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {DURATION_FILTERS.map((duration) => (
          <button
            key={duration.id}
            type="button"
            onClick={() => setActiveDuration(duration.id)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              padding: "4px 10px",
              borderRadius: "var(--radius-small)",
              border: "none",
              cursor: "pointer",
              background: activeDuration === duration.id ? "var(--color-accent-green)" : "var(--color-elevated)",
              color: activeDuration === duration.id ? "var(--color-base)" : "var(--color-text-muted)"
            }}
          >
            {duration.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
          maxHeight: "320px",
          overflowY: "auto",
          paddingRight: "4px"
        }}
      >
        {filteredRoutes.map((route) => (
          <button
            key={route.id}
            type="button"
            onClick={() => onSelect(route)}
            style={{
              background: selectedId === route.id ? "var(--color-elevated)" : "var(--color-surface)",
              border: selectedId === route.id ? "1px solid var(--color-accent-blue)" : "1px solid transparent",
              borderRadius: "var(--radius-standard)",
              padding: "12px",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                letterSpacing: "0.08em",
                marginBottom: "4px"
              }}
            >
              {route.origin} {" -> "} {route.destination}
            </div>

            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                color: "var(--color-text-secondary)",
                marginBottom: "8px",
                lineHeight: 1.3
              }}
            >
              {route.originCity} {" -> "} {route.destinationCity}
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-accent-green)",
                letterSpacing: "0.06em"
              }}
            >
              {formatDuration(route.durationMinutes)}
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
                marginTop: "4px",
                letterSpacing: "0.06em"
              }}
            >
              {route.aircraft} - {route.distanceKm.toLocaleString()}KM
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
