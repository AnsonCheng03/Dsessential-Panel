import { type QRL, component$ } from "@builder.io/qwik";
import styles from "./prompt.module.css";

export default component$(
  ({ message, onClose }: { message: string; onClose?: QRL<() => void> }) => {
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
