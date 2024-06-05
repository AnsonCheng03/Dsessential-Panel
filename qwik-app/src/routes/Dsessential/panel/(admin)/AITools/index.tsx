import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { type RequestHandler } from "@builder.io/qwik-city";
import { server$ } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";

// Server function to generate a unique token
export const generateToken = server$(() => {
  return Math.random().toString(36).substr(2);
});

// onRequest handler to check session
export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (session?.user && (session.user as any).role === "student") {
    throw event.redirect(302, `/Dsessential/panel`);
  }
};

export default component$(() => {
  const iframeUrl = useSignal("/chatgpt");

  // Function to set the token as a cookie
  const setToken = $(async () => {
    const token = await generateToken();
    document.cookie = `authToken=${token}; path=/`;
    iframeUrl.value = `/chatgpt?token=${token}`;
  });

  return (
    <div>
      <button onClick$={setToken}>Access ChatGPT</button>
      <iframe class={styles.iframe} src={iframeUrl.value}></iframe>
    </div>
  );
});
