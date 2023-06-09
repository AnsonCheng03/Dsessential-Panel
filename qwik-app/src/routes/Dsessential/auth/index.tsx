import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import SignIn from "./(signIn)/signIn";
import ResetPassword from "./(resetPassword)/resetPassword";
import styles from "./index.module.css";

export default component$(() => {
  const session = useAuthSession();
  const adminRole = useSignal(false);
  const formState = useSignal<"signIn" | "resetPassword">("signIn");
  const userName = useSignal<string | undefined>(undefined);

  if (session.value) return null;

  return (
    <div class={styles.center}>
      {formState.value === "resetPassword" ? (
        <ResetPassword
          formState={formState}
          adminRole={adminRole}
          style={styles}
          userName={userName}
        />
      ) : (
        <SignIn
          formState={formState}
          adminRole={adminRole}
          style={styles}
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
