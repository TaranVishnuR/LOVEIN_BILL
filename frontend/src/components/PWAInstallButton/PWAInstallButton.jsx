import usePWAInstall from "../../hooks/usePWAInstall";
import styles from "./PWAInstallButton.module.css";

export default function PWAInstallButton() {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <button
      className={styles.installButton}
      onClick={install}
    >
      Install LOVEIN
    </button>
  );
}