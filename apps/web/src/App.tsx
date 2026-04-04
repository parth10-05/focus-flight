import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import PreFlight from "@/pages/PreFlight";

function FlightPage(): JSX.Element {
  return <div />;
}

function DebriefPage(): JSX.Element {
  return <div />;
}

function LogbookPage(): JSX.Element {
  return <div />;
}

function AnalyticsPage(): JSX.Element {
  return <div />;
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/preflight" element={<PreFlight />} />
        <Route path="/flight/:id" element={<FlightPage />} />
        <Route path="/debrief/:id" element={<DebriefPage />} />
        <Route path="/logbook" element={<LogbookPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/preflight" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
