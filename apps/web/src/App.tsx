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
import { AppShell } from "@/components/layouts/AppShell";
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

export default function App(): JSX.Element {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={(
            <RequireAuth>
              <AppShell>
                <Navigate to="/preflight" replace />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route
          path="/preflight"
          element={(
            <RequireAuth>
              <AppShell>
                <PreFlight />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route
          path="/flight/:id"
          element={(
            <RequireAuth>
              <AppShell hideNav>
                <ActiveFlight />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route
          path="/debrief/:id"
          element={(
            <RequireAuth>
              <AppShell>
                <Debrief />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route
          path="/logbook"
          element={(
            <RequireAuth>
              <AppShell>
                <Logbook />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route
          path="/analytics"
          element={(
            <RequireAuth>
              <AppShell>
                <Analytics />
              </AppShell>
            </RequireAuth>
          )}
        />
        <Route path="*" element={<Navigate to="/logbook" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
