import { Slot, component$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";

export default component$(() => {
  const session = useAuthSession();
  const nav = useNavigate();

  useVisibleTask$(async () => {
    if (!session.value) {
      nav("/Dsessential");
    }
  });

  return <Slot />;
});
