import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import styles from "./error.module.css";

export default component$(() => {
  return (
    <main class={styles.main}>
      <div style={styles.container}>
        <h1>抱歉，好像有點問題！</h1>
        <br />
        <p>
          Type: 404 / IP:
          {}
        </p>
        <p>如問題持續，請聯絡管理員（admin@dsessential.com）</p>
      </div>
      <div style={styles.bottom} />
    </main>
  );
});

export const head: DocumentHead = {
  title: "404 | 尚研閱文憑試支援中心",
  meta: [
    {
      name: "description",
      content: "尚研閱文憑試支援中心",
    },
  ],
};
