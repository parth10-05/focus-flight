import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type SessionContextValue = {
  session: Session | null;
  loading: boolean;
};

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionContext provider");
  }

  return context;
}
