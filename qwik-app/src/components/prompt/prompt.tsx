import { type QRL, component$ } from "@builder.io/qwik";
import style from "./prompt.module.css";

export default component$(
  ({ message, onClose }: { message: string; onClose?: QRL<() => void> }) => {
    return (
      <div class={style.promptBox}>
        <div class={style.prompt}>
          <div class={style.promptMessage}>
            {message.split("\\n").map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div class={style.promptButton}>
            <button
              class={style.button}
              onClick$={() => {
                if (onClose) onClose();
                document.querySelector(`.${style.promptBox}`)?.remove();
              }}
            >
              確定
            </button>
          </div>
        </div>
      </div>
    );
  }
);
