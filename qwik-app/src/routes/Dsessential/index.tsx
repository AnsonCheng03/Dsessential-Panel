import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";

export default component$(() => {
  const session = useAuthSession();
  const nav = useNavigate();

  useVisibleTask$(async () => {
    if (session.value) {
      nav("/Dsessential/panel");
    } else {
      nav("/Dsessential/auth");
    }
  });
  return null;
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
