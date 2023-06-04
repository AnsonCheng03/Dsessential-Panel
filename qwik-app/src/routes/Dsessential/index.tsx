import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import {
  useAuthSession,
  useAuthSignin,
  useAuthSignout,
} from "~/routes/plugin@auth";

export default component$(() => {
  const session = useAuthSession();
  const nav = useNavigate();

  useVisibleTask$(async () => {
    if (session.value) {
      nav("/Dsessential");
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
