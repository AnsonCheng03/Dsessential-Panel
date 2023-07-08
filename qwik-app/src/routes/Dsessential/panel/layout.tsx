import { Slot, component$ } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import { type RequestHandler } from "@builder.io/qwik-city";
import styles from "./layout.module.css";
import NavBar from "~/components/navBar/navBar";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/Dsessential/auth?callbackUrl=${event.url.href}`
    );
  }
};

export default component$(() => {
  const navlist = [
    ["Item", "主頁", "/"],
    [
      "List",
      "學生資源",
      "#",
      [
        ["Item", "課堂重播", "Features/School/Replay"],
        ["Item", "範文", "https://www.dsessential.com/paper1a"],
        [
          "Item",
          "其他資源",
          "https://drive.google.com/drive/folders/1_3ghe0QBmehvIGCfo6masnfUkLUpiBa3?usp=sharing",
        ],

        ["Item", "修改密碼", "Features/stuinfo/resetpw.php"],
      ],
    ],
  ];

  return (
    <>
      <NavBar navlist={navlist} />
      <main>
        <section class={styles.body} id="mainpage">
          <Slot />
        </section>
      </main>
    </>
  );
});
