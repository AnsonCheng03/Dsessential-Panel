import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import styles from "./index.module.css";
import logo from "~/components/logo/logo.png";

export default component$(() => {
  const session = useAuthSession();
  const user = (session.value as any).user;

  return (
    <div class={styles.profileBox}>
      <img src={logo}></img>
      <br />
      學生編號：{user.username} <br />
      角色： {user.role === "student" ? "學生" : "管理員"}
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
