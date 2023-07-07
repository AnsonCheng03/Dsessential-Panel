import { component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/Dsessential/auth?callbackUrl=${event.url.href}`
    );
  }
  throw event.redirect(302, `/Dsessential/panel`);
};

export default component$(() => {
  return <></>;
});

export const head: DocumentHead = {
  title: "尚研閱文憑試支援中心",
  meta: [
    {
      name: "description",
      content: "尚研閱文憑試支援中心",
    },
  ],
};
