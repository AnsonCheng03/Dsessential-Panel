import { Slot, component$, useVisibleTask$, $ } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import { server$, type RequestHandler } from "@builder.io/qwik-city";
import styles from "./layout.module.css";
import NavBar from "~/components/navBar/navBar";
import { useAuthSession } from "~/routes/plugin@auth";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/Dsessential/auth?callbackUrl=${event.url.href}`
    );
  }
};
// TODO: Update Token
// const updateToken = server$(async function () {
//   try {
//     const userSession = (await this.sharedMap.get("session")) as any;
//     // console.log("Updating Token", userSession);
//     const res = await fetch(
//       `https://${this.url.hostname}:3500/auth/refresh-token`,
//       {
//         method: "POST",
//         cache: "no-store",
//         headers: {
//           authorization: `Bearer ${userSession?.accessToken}`,
//         },
//       }
//     );
//     if (res.status !== 201) throw "Auth Error";
//     const newToken = await res.text();
//     // console.log("New Token", newToken);
//     this.sharedMap.set("session", {
//       user: {
//         ...userSession.user,
//       },
//       accessToken: "await res.text()",
//       expires: "new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()",
//     });
//     // console.log("Token Updated", this.sharedMap.get("session"));
//   } catch (error) {
//     // console.log(error);
//   }
//   // console.log(this.sharedMap.get("session"));
// });

export default component$(() => {
  const session = useAuthSession();
  const user = (session.value as any).user;

  // useVisibleTask$(() => {
  //   setInterval(async () => {
  //     await updateToken();
  //   }, 2000);
  // });

  const navlist =
    user.role === "student"
      ? [
          ["Item", "主頁", "/"],
          [
            "List",
            "學生資源",
            "#",
            [
              ["Item", "課堂重播", "/panel/lessonReplay"],

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
              ["Item", "點名系統", "/Features/School/attendance"],
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
              ["Item", "轉換身分", "/Features/Server/changerole"],
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
