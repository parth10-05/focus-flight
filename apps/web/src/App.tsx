import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import ActiveFlight from "@/pages/ActiveFlight";
import Analytics from "@/pages/Analytics";
import Debrief from "@/pages/Debrief";
import Logbook from "@/pages/Logbook";
import PreFlight from "@/pages/PreFlight";

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/preflight" element={<PreFlight />} />
        <Route path="/flight/:id" element={<ActiveFlight />} />
        <Route path="/debrief/:id" element={<Debrief />} />
        <Route path="/logbook" element={<Logbook />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/preflight" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
