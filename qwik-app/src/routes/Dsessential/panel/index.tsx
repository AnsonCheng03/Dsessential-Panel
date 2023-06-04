import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useAuthSignout } from "~/routes/plugin@auth";

export default component$(() => {
  const signOut = useAuthSignout();

  return <button onClick$={() => signOut.submit({})}>Sign Out</button>;
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
