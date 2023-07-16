import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import styles from "./index.module.css";
import logo from "~/components/logo/logo.png";

export const useGetUserData = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.BACKEND_ADDRESS}:3500/auth/profile`,
      {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    if (!data.statusCode) return data;
  } catch (error) {
    console.log(error);
  }
});

export default component$(() => {
  const userData = useGetUserData().value;

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
