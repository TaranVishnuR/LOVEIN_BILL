import { useEffect, useState } from "react";

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  // Log state updates whenever canInstall changes
  useEffect(() => {
    console.log("canInstall =", canInstall);
  }, [canInstall]);

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      console.log("beforeinstallprompt fired");

      e.preventDefault();

      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const installedHandler = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      console.log("LOVEIN installed successfully.");
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      console.log("User accepted installation.");
    } else {
      console.log("User dismissed installation.");
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return {
    canInstall,
    install,
  };
}
