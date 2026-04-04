import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import { useEffect, useState } from "react";
import ActiveFlight from "@/pages/ActiveFlight";
import Analytics from "@/pages/Analytics";
import Auth from "@/pages/Auth";
import Debrief from "@/pages/Debrief";
import Logbook from "@/pages/Logbook";
import PreFlight from "@/pages/PreFlight";
import { supabase } from "@/lib/supabase";

function useSessionState(): { isLoading: boolean; isAuthenticated: boolean } {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(data.session));
      setIsLoading(false);
    };

    void initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(session));
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated };
}

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { isLoading, isAuthenticated } = useSessionState();

  if (isLoading) {
    return <div className="min-h-screen bg-[#0d0e0f]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function RootRedirect(): JSX.Element {
  const { isLoading, isAuthenticated } = useSessionState();

  if (isLoading) {
    return <div className="min-h-screen bg-[#0d0e0f]" />;
  }

  return <Navigate to={isAuthenticated ? "/preflight" : "/auth"} replace />;
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/preflight"
          element={(
            <RequireAuth>
              <PreFlight />
            </RequireAuth>
          )}
        />
        <Route
          path="/flight/:id"
          element={(
            <RequireAuth>
              <ActiveFlight />
            </RequireAuth>
          )}
        />
        <Route
          path="/debrief/:id"
          element={(
            <RequireAuth>
              <Debrief />
            </RequireAuth>
          )}
        />
        <Route
          path="/logbook"
          element={(
            <RequireAuth>
              <Logbook />
            </RequireAuth>
          )}
        />
        <Route
          path="/analytics"
          element={(
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          )}
        />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
