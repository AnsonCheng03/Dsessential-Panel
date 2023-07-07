import { Slot, component$, useVisibleTask$ } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    return;
  }
  throw event.redirect(302, `/Dsessential`);
};

export default component$(() => {
  return <Slot />;
});
