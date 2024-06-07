import { $, component$, useVisibleTask$ } from "@builder.io/qwik";
import { changeSession } from "~/routes/auth/changeSession";

export default component$(() => {
  useVisibleTask$(async () => {
    // get the accessToken from the url params
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const SID = urlParams.get("SID");
    if (!accessToken || !SID) {
      // go to blank page if no accessToken or SID
      window.location.href = "about:blank";
      return;
    }

    await changeSession(accessToken, "changeRole", SID);
  });

  return (
    <>
      <div>Redirecting...</div>
    </>
  );
});
