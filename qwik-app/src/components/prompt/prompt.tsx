import { Signal, component$ } from "@builder.io/qwik";
import style from "./prompt.module.css";

export default component$(
  ({
    message,
    removedBox,
  }: {
    message: string;
    removedBox?: Signal<boolean>;
  }) => {
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
                document.querySelector(`.${style.promptBox}`)?.remove();
                if (removedBox) removedBox.value = true;
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
