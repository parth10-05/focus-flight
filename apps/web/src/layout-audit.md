# Width Constraint Audit

## apps\web\src\components\flight\BlockedSiteTag.tsx
- L6: return <span className="px-2 py-1 bg-secondary-container/30 border border-secondary/20 font-mono text-[10px] text-secondary">{site}</span>;

## apps\web\src\components\preflight\BlockedSectorChip.tsx
- L8: <div className="px-3 py-1 bg-secondary-container/30 border border-secondary/20 flex items-center gap-4">

## apps\web\src\components\preflight\TelemetryTile.tsx
- L8: <div className="bg-surface-container-lowest p-4 border border-outline-variant/10">

## apps\web\src\components\shared\StatusBadge.tsx
- L8: return "bg-secondary-container text-on-secondary-container";
- L11: return "bg-error-container text-on-error-container";
- L13: return "bg-primary-container text-on-primary-container";

## apps\web\src\pages\ActiveFlight.tsx
- L107: <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 pointer-events-none">
- L113: <h1 className="font-mono text-sm tracking-[0.15em] text-primary bg-surface-container-low/40 px-4 py-1 rounded-sm border border-outline-variant/10">
- L119: className="font-label text-[10px] tracking-widest text-primary/70 border border-primary/30 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 uppercase disabled:opacity-60"
- L126: className="font-label text-[10px] tracking-widest text-error/60 border border-error/20 px-4 py-2 hover:bg-error/10 hover:text-error transition-all duration-300 uppercase disabled:opacity-60"
- L137: <div className="w-full h-full bg-[#08090A] relative overflow-hidden">
- L140: className="w-full h-full object-cover mix-blend-luminosity opacity-20"
- L144: <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 1000 600">
- L165: <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
- L203: <footer className="fixed bottom-0 w-full z-50 h-10 border-t border-primary/5 bg-background flex justify-around items-center px-12">
- L211: <div className="w-full h-[2px] bg-primary animate-scan absolute top-0"></div>

## apps\web\src\pages\Analytics.tsx
- L60: <div className="bg-surface-container-low p-8 border-l border-white/5 relative overflow-hidden" style={{ borderRadius: "var(--radius-standard)" }}>
- L70: <div className="border-t border-white w-full"></div>
- L71: <div className="border-t border-white w-full"></div>
- L72: <div className="border-t border-white w-full"></div>
- L73: <div className="border-t border-white w-full"></div>
- L75: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[40%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">MON</span></div>
- L76: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[65%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">TUE</span></div>
- L77: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[50%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">WED</span></div>
- L78: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary text-on-primary h-[92%] border-t-2 border-primary ring-1 ring-primary/20"></div><span className="technical-font text-[10px] mt-4 text-primary">THU</span></div>
- L79: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[78%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">FRI</span></div>
- L80: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[30%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">SAT</span></div>
- L81: <div className="flex-1 flex flex-col justify-end items-center"><div className="w-full bg-primary/20 h-[25%] border-t border-primary/60"></div><span className="technical-font text-[10px] mt-4 text-slate-500">SUN</span></div>
- L85: <div className="bg-surface-container p-8 flex flex-col justify-between border-t border-white/5" style={{ borderRadius: "var(--radius-standard)" }}>

## apps\web\src\pages\Auth.tsx
- L165: <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-[#1d2022]/70 backdrop-blur-[16px]">
- L170: <section className="relative z-10 mx-auto w-full max-w-6xl pl-10 pr-6 pt-16 pb-20">
- L173: <p className="mt-6 max-w-xl text-[#939eb4] text-sm leading-[1.6] tracking-[0.04em]">
- L178: <div className="max-w-3xl bg-[#1d2022]/70 backdrop-blur-[16px] rounded-small pl-8 pr-4 py-10">
- L216: className="w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]"
- L236: className="w-full bg-transparent border-0 border-b-2 border-[#45484b] text-[#e3e5e9] py-3 font-mono tracking-[0.04em] text-sm outline-none transition-all duration-150 ease-linear focus:border-[#c1c7ce] focus:shadow-[0_2px_0_0_rgba(65,72,77,1)]"
- L246: className="px-6 py-3 rounded-small bg-[#c1c7ce] text-[#3b4147] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear disabled:opacity-60 disabled:cursor-not-allowed"
- L254: className="px-6 py-3 rounded-small border border-[#45484b]/20 text-[#c1c7ce] font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-150 ease-linear hover:bg-[#c1c7ce]/[0.02] disabled:opacity-60 disabled:cursor-not-allowed"

## apps\web\src\pages\Debrief.tsx
- L103: <div className="relative z-10 w-full">
- L106: <p className="font-label text-secondary tracking-widest text-xs md:text-sm uppercase leading-relaxed" style={{ maxWidth: "100%" }}>
- L111: <div className="w-full h-64 mb-16 relative overflow-hidden flex items-center justify-center">
- L112: <img className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-75 mix-blend-screen" data-alt="Cinematic wide shot of the Earth's curvature at dawn from space with deep blue shadows and a thin glowing atmosphere line" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH2yHlvrtsNXYR4zCEXoFSRGs7qNoULcKyelFcnagRPNIJH-nM7PrAkizSTSR2NoyfqloPH4XiwePI8jyjYDa3Fmljgad42sReqSpLjZGtWGNB2rE2HYc1RgypNK8Rqb2WiSDE0B0BAGj2mwWjNGsWB7rM7eCfGBkiPzGYfUlS5kI1NYN6fFrnbutzB1mDumwoBrXOxnwvKhfR0lw8OpV_cIm1P83r4HBrazIhDr7dqp5iZe6oRLrbYz_PXBRH2qFtgZ-MIoXvCQL5" />
- L114: <div className="relative w-full h-px bg-outline-variant/30 flex items-center justify-center" style={{ maxWidth: "100%" }}>
- L123: <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full border border-white/5 bg-white/5 mb-16">
- L163: className="group relative px-12 py-4 bg-primary text-on-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-tertiary-container hover:pr-14"
- L169: className="group relative px-12 py-4 bg-surface-container-low text-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-surface-container"
- L175: className="group relative px-12 py-4 bg-surface-container-low text-primary font-label font-medium tracking-[0.3em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:bg-surface-container"
- L184: <footer className="bg-surface-container-low border-t border-white/5 py-4 px-8 flex flex-col md:flex-row justify-between items-center font-mono text-[10px] tracking-tighter text-outline select-none" style={{ gridColumn: "1 / -1" }}>

## apps\web\src\pages\Logbook.tsx
- L97: <div className="bg-surface-container-high p-4 border-l border-primary/30 flex items-center gap-4">
- L107: <section className="bg-surface-container-low border border-outline-variant/10">
- L141: <div className="p-6 bg-surface-container-lowest flex justify-center border-t border-outline-variant/10">

## apps\web\src\pages\PreFlight.tsx
- L243: className={`w-full bg-transparent border-b-2 ${errors.origin ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`}
- L255: className={`w-full bg-transparent border-b-2 ${errors.destination ? "border-[#ee7d77]" : "border-outline-variant"} focus:border-primary outline-none py-2 font-mono text-sm tracking-widest text-on-surface transition-all`}
- L271: className={`preflight-duration-slider w-full appearance-none bg-transparent cursor-pointer ${errors.duration ? "[&::-webkit-slider-runnable-track]:bg-[#ee7d77]" : ""}`}
- L288: <div className="bg-surface-container-low p-6 flex flex-col justify-between">
- L324: className="w-full h-full object-cover grayscale opacity-30"

## apps\web\src\styles\globals.css
- L53: .container {
- L55: max-width: none !important;
