import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { useAuthSession, useAuthSignout } from "~/routes/plugin@auth";
import styles from "./index.module.css";
import logo from "~/components/logo/logo.png";

export const getUserData = routeLoader$(async (requestEvent) => {
  const access_token = requestEvent.sharedMap.get("session").user.access_token;
  try {
    const res = await fetch(
      `http://${requestEvent.url.hostname}:3500/auth/profile`,
      {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await res.json();
    if (!data.statusCode) return data;
    throw "Error";
  } catch (error) {
    throw requestEvent.redirect(302, `/api/auth/signout?error=${error}`);
  }
});

export default component$(() => {
  const userData = getUserData().value;

  return (
    <div class={styles.profileBox}>
      <img src={logo}></img>
      <br />
      學生編號：{userData?.username} <br />
      角色： {userData?.role === "student" ? "學生" : "管理員"}
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
