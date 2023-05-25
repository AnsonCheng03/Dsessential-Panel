import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import {
  useAuthSession,
  useAuthSignin,
  useAuthSignout,
} from "~/routes/plugin@auth";

export default component$(() => {
  const signIn = useAuthSignin();
  const signOut = useAuthSignout();
  const session = useAuthSession();

  return (
    <div class="userAuth">
      {session.value?.user ? (
        <button onClick$={() => signOut.submit({})}>Sign Out</button>
      ) : (
        <button
          onClick$={() =>
            signIn.submit({
              options: {},
            })
          }
        >
          Sign In
        </button>
      )}
      <Link href="auth">Home</Link>
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
