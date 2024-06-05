import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { type RequestHandler } from "@builder.io/qwik-city";
import { server$ } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";

// Server function to generate and send the token to the Express server
export const generateAndSendToken = server$(async () => {
  const token = Math.random().toString(36).substr(2);
  const response = await fetch("/chatgpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Request": "true",
    },
    body: JSON.stringify({ token }),
  });
  if (response.ok) {
    return token;
  } else {
    throw new Error("Failed to authenticate");
  }
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

  // Function to set the token as a cookie and send it to the server
  const setToken = $(async () => {
    try {
      const token = await generateAndSendToken();
      document.cookie = `authToken=${token}; path=/`;
      iframeUrl.value = `/chatgpt?token=${token}`;
    } catch (error) {
      alert("Failed to authenticate");
    }
  });

  return (
    <div>
      <button onClick$={setToken}>Access ChatGPT</button>
      <iframe class={styles.iframe} src={iframeUrl.value}></iframe>
    </div>
  );
});
