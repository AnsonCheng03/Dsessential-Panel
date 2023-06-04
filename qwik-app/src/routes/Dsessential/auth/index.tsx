import { type Signal, component$, useSignal, useStore } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import SignIn from "./(signIn)";
import ResetPassword from "./(resetPassword)";
import style from "./index.module.css";

export default component$(() => {
  const session = useAuthSession();
  const formState = useSignal<"signIn" | "resetPassword">("signIn");
  const adminRole = useSignal(false);
  const userName = useSignal<string | undefined>(undefined);

  if (session.value) return null;

  return (
    <div class={style.center}>
      {formState.value === "resetPassword" ? (
        <ResetPassword
          formState={formState}
          adminRole={adminRole}
          style={style}
          userName={userName}
        />
      ) : (
        <SignIn
          formState={formState}
          adminRole={adminRole}
          style={style}
          userName={userName}
        />
      )}
    </div>
  );
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
