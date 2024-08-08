import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { changeSession } from "~/routes/auth/changeSession";

export const onRequest: RequestHandler = ({ query, redirect }) => {
  const accessToken = query.get("accessToken");
  const SID = query.get("SID");
  if (!accessToken || !SID) {
    throw redirect(302, "about:blank");
  }
};

export default component$(() => {
  useVisibleTask$(async () => {
    // get the accessToken from the url params
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const SID = urlParams.get("SID");
    if (!accessToken || !SID) {
      return;
    }

    // add a cookie to the browser to identify its a changeRole request
    document.cookie = `changeRole=true; path=/`;

    await changeSession(accessToken, "changeRole", SID);
  });

  return (
    <>
      <div>Redirecting...</div>
    </>
  );
});
