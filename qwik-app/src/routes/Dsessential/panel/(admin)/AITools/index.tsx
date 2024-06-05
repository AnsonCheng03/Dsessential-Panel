import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { type RequestHandler, routeLoader$ } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";
import { randomBytes } from "crypto";

export const useGenerateAndSendToken = routeLoader$(async () => {
  const token = randomBytes(32).toString("hex");
  console.log(`Generated token: ${token}`);
  const response = await fetch("https://localhost:3000/chatgpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Request": "true",
    },
    body: JSON.stringify({ token }),
  });
  console.log(`Server response status: ${response.status}`);
  if (response.ok) {
    return token;
  } else {
    const errorText = await response.text();
    console.error(`Failed to authenticate. Server response: ${errorText}`);
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
  const token = useGenerateAndSendToken().value;
  const iframeUrl = useSignal(`/chatgpt?token=${token}`);

  useVisibleTask$(async () => {
    if (token) {
      document.cookie = `authToken=${token}; path=/`;
    }
  });

  return (
    <div>
      <iframe class={styles.iframe} src={iframeUrl.value}></iframe>
    </div>
  );
});
