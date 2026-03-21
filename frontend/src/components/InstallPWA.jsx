import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    setInstallPrompt(null);
  };

  if (!installPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-[#0b4ea2] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-[999] animate-bounce-short">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl">
          <Download size={20} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Install SmartBus</h4>
          <p className="text-xs text-blue-100">Add to home screen for offline access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-white text-[#0b4ea2] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-slate-100 transition-colors"
        >
          Install
        </button>
        <button onClick={() => setIsDismissed(true)} className="p-1 hover:bg-white/20 rounded-lg transition-colors text-blue-200">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
