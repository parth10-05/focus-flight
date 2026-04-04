import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

declare const chrome: {
  storage?: {
    local?: {
      set: (items: Record<string, unknown>, callback?: () => void) => void;
    };
  };
};

export default function Auth(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveSessionToChromeStorage = (accessToken: string | undefined) => {
    if (!accessToken) {
      return;
    }

    if (typeof chrome !== "undefined" && chrome.storage?.local?.set) {
      chrome.storage.local.set({ supabaseSessionToken: accessToken });
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      saveSessionToChromeStorage(data.session?.access_token);
      navigate("/preflight");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      saveSessionToChromeStorage(data.session?.access_token);
      setNoticeMessage("Signup request submitted. Check your email if confirmation is enabled.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden relative bg-[#0d0e0f] text-[#c1c7ce]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 right-[8%] h-72 w-72 rounded-full bg-[#c1c7ce]/[0.04] blur-[40px]"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-[#1d2022]/70 backdrop-blur-[16px]">
        <div className="text-xl font-light tracking-[0.2em] text-[#c1c7ce]">AeroFocus</div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#939eb4]">AUTH CHANNEL</div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-6xl pl-10 pr-6 pt-16 pb-20">
        <div className="mb-16 pl-8 pr-4">
          <h1 className="font-sans font-light text-5xl tracking-[0.1em] uppercase leading-[1.15] text-[#c1c7ce]">Mission Authentication</h1>
          <p className="mt-6 max-w-xl text-[#939eb4] text-sm leading-[1.6] tracking-[0.04em]">
            Authenticate flight control before initiating a deep-work trajectory.
          </p>
        </div>

        <div className="max-w-3xl bg-[#1d2022]/70 backdrop-blur-[16px] rounded-small pl-8 pr-4 py-10">
          <div className="mb-8 grid gap-2">
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#939eb4]">Access Channel</span>
            <span className="font-mono text-xs text-[#a9abaf]">SECURE_AUTH_PIPELINE_01</span>
          </div>

          <form className="grid gap-8" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <label
                className="text-[#939eb4] text-[11px] tracking-[0.16em] uppercase"
                htmlFor="email"
                style={{ fontFamily: "'Space Grotesk', var(--font-sans)" }}
              >
                Email Vector
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]"
                placeholder="pilot@aerofocus.io"
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-[#939eb4] text-[11px] tracking-[0.16em] uppercase"
                htmlFor="password"
                style={{ fontFamily: "'Space Grotesk', var(--font-sans)" }}
              >
                Passphrase
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]"
                placeholder="••••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-small bg-[#c1c7ce] text-[#3b4147] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Authenticating" : "Login"}
              </button>
              <button
                type="button"
                onClick={handleSignup}
                disabled={isLoading}
                className="px-6 py-3 rounded-small border border-[#45484b]/20 text-[#c1c7ce] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear hover:bg-[#c1c7ce]/[0.02] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Sign Up
              </button>
            </div>
          </form>

          {errorMessage ? (
            <p className="mt-6 font-mono text-xs tracking-[0.04em] text-[#ee7d77]">{errorMessage}</p>
          ) : null}

          {noticeMessage ? (
            <p className="mt-6 font-mono text-xs tracking-[0.04em] text-[#939eb4]">{noticeMessage}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
