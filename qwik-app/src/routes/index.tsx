import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import styles from "./index.module.css";

export default component$(() => {
  return (
    <div class={styles.center}>
      <h1>尚研閱文憑試支援中心</h1>
      <h2>分區選擇</h2>
      <div class={styles.container}>
        <Link
          class={styles.card}
          href="/"
          onClick$={() => {
            window.alert("暫時停用，請聯絡95575713預約房間~");
          }}
        >
          預約房間
        </Link>
        <Link class={styles.card} href="/Dsessential">
          學生專區
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "分區選擇",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
