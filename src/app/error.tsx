"use client";

import styles from "./page.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.page}>
      <section className={styles.errorPanel} role="alert">
        <p className={styles.eyebrow}>Fehler</p>
        <h1>Die Aktion konnte nicht abgeschlossen werden.</h1>
        <p>
          {error.message ||
            "Bitte prüfe deine Eingaben und versuche es erneut."}
        </p>
        <button type="button" onClick={reset}>
          Erneut versuchen
        </button>
      </section>
    </main>
  );
}
