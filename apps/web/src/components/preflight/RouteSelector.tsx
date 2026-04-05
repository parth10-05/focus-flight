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

  const toCoordinate = (code: string, axis: "lat" | "lng"): string => {
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
    <div className="preflight-route-selector">
      <div className="preflight-route-filters mb-4">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => setActiveRegion(region.id)}
            className={`preflight-chip ${activeRegion === region.id ? "is-active" : ""}`}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div className="preflight-route-filters mb-5">
        {DURATION_FILTERS.map((duration) => (
          <button
            key={duration.id}
            type="button"
            onClick={() => setActiveDuration(duration.id)}
            className={`preflight-chip preflight-chip-alt ${activeDuration === duration.id ? "is-active" : ""}`}
          >
            {duration.label}
          </button>
        ))}
      </div>

      <div className="preflight-route-grid">
        {filteredRoutes.map((route) => (
          <button key={route.id} type="button" onClick={() => onSelect(route)} className={`preflight-route-card ${selectedId === route.id ? "is-selected" : ""}`}>
            <div className="preflight-route-code">{route.id}</div>

            <div className="preflight-route-top-row">
              <div>
                <div className="preflight-route-leg-label">DEPARTURE</div>
                <div className="preflight-route-iata">{route.origin}</div>
                <div className="preflight-route-coords">{toCoordinate(route.origin, "lat")}, {toCoordinate(route.origin, "lng")}</div>
              </div>

              <div className="preflight-route-arrow">
                <div className="preflight-route-arrow-line"></div>
                <span className="material-symbols-outlined">flight_takeoff</span>
              </div>

              <div className="text-right">
                <div className="preflight-route-leg-label">ARRIVAL</div>
                <div className="preflight-route-iata">{route.destination}</div>
                <div className="preflight-route-coords">{toCoordinate(route.destination, "lat")}, {toCoordinate(route.destination, "lng")}</div>
              </div>
            </div>

            <div className="preflight-route-bottom-row">
              <div>
                <div className="preflight-route-leg-label">MISSION DURATION</div>
                <div className="preflight-route-duration">{formatDuration(route.durationMinutes)}</div>
              </div>

              <div className="text-right">
                <div className="preflight-route-leg-label">AIRCRAFT</div>
                <div className="preflight-route-aircraft">{route.aircraft}</div>
                <div className="preflight-route-distance">{route.distanceKm.toLocaleString()}KM</div>
              </div>
            </div>

            <div className="preflight-route-city-line">
              {route.originCity} {" -> "} {route.destinationCity}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
