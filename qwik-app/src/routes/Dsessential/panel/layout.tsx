import { Slot, component$ } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import { type RequestHandler } from "@builder.io/qwik-city";
import styles from "./layout.module.css";
import NavBar from "~/components/navBar/navBar";
import { useAuthSession } from "~/routes/plugin@auth";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/Dsessential/auth?callbackUrl=${event.url.href}`,
    );
  }
};

export default component$(() => {
  const session = useAuthSession();
  const user = (session.value as any).user;

  const navlist =
    user.role === "student"
      ? [
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

              // ["Item", "修改密碼", "Features/stuinfo/resetpw.php"],
            ],
          ],
        ]
      : [
          ["Item", "主頁", "/"],
          /*
    ["List", "場地管理", "#", [
        ["Item", "預約時間表", "#"],
        ["Item", "預約管理", "#"],
        ["Item", "用戶管理", "#"],
        ["Item", "設定", "#"],
    ]],
    */
          [
            "List",
            "學生管理",
            "#",
            [
              //    ["Item", "學生資料", "#"],
              ["Item", "點名系統", "Features/School/attendance"],
              //    ["Item", "時間表", "#"],
            ],
          ],

          [
            "List",
            "其他功能",
            "#",
            [
              /*
        ["Item", "重設密碼", "#"],
        ["Item", "遠端列印", "#"],
        ["Item", "閉路電視", "#"],
        */
              ["Item", "轉換身分", "Features/Server/changerole"],
              /*
            ["List", "系統管理", "#", [
            ["Item", "訪問紀錄", "#"],
            ["Item", "系統資源", "#"],
        ]],
        */
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
