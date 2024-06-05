import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { type RequestHandler } from "@builder.io/qwik-city";
import { server$ } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";
import { randomBytes } from "crypto";

// Server function to generate and send the token to the Express server
export const generateAndSendToken = server$(async () => {
  const token = randomBytes(32).toString("hex");
  console.log(`Generated token: ${token}`);
  const response = await fetch("/chatgpt", {
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
  const iframeUrl = useSignal("/chatgpt");

  // Automatically generate and send the token on component mount
  useVisibleTask$(async () => {
    try {
      const token = await generateAndSendToken();
      document.cookie = `authToken=${token}; path=/`;
      iframeUrl.value = `/chatgpt?token=${token}`;
    } catch (error) {
      console.error(error);
      alert("Failed to authenticate");
    }
  });

  return (
    <div>
      <iframe class={styles.iframe} src={iframeUrl.value}></iframe>
    </div>
  );
});
