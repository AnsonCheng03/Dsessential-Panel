import { type QRL, component$ } from "@builder.io/qwik";
import styles from "./prompt.module.css";

export default component$(
  ({
    message,
    onClose,
    refresh = false,
  }: {
    message: string;
    onClose?: QRL<() => void>;
    refresh?: boolean;
  }) => {
    return (
      <div class={styles.promptBox}>
        <div class={styles.prompt}>
          <div class={styles.promptMessage}>
            {message.split("\\n").map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div class={styles.promptButton}>
            <button
              class={styles.button}
              onClick$={() => {
                if (onClose) onClose();
                document.querySelector(`.${styles.promptBox}`)?.remove();
                // refresh the page
                if (refresh) window.location.reload();
              }}
            >
              確定
            </button>
          </div>
        </div>
      </div>
    );
  },
);
