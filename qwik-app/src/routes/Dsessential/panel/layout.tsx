import { Slot, component$ } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import type { RequestHandler } from "@builder.io/qwik-city";
import { useAuthSignout } from "~/routes/plugin@auth";
import styles from "./layout.module.css";

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
  const signOut = useAuthSignout();

  const navlist = [
    ["Item", "主頁", "index.php"],
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
      <nav class={styles.header}>
        <div class={styles.container}>
          <input type="checkbox" class={styles.mobileCheck} />

          <div class={styles.logoContainer}>
            <h3 class={styles.logo}>
              DSE<span>ssential</span>
            </h3>
          </div>

          <div class={styles.navButton}>
            <div class={styles.navLinks}>
              <ul class={styles.navList}>
                {navlist.map((items: any) => {
                  return (
                    <li class={styles.navLink} key={items[1] as string}>
                      {items[0] == "Item" && (
                        <a href={items[2] as string}>{items[1]}</a>
                      )}
                      {items[0] == "List" && (
                        <>
                          <a href={items[2] as string}>{items[1]}</a>
                          <div class={styles.dropdown}>
                            <ul class={styles.navList}>
                              {items[3].map((items: any) => {
                                return (
                                  <li
                                    class={styles.dropdownLink}
                                    key={items[1] as string}
                                  >
                                    {items[0] == "Item" && (
                                      <a href={items[2] as string}>
                                        {items[1]}
                                      </a>
                                    )}
                                    {items[0] == "List" && (
                                      <>
                                        <a href={items[2] as string}>
                                          {items[1]}
                                        </a>
                                        <div
                                          class={[
                                            styles.dropdown,
                                            styles.second,
                                          ]}
                                        >
                                          <ul class={styles.navList}>
                                            {items[3]?.map(
                                              (items: string[]) => {
                                                return (
                                                  <li
                                                    class={styles.dropdownLink}
                                                    key={items[1]}
                                                  >
                                                    <a href={items[2]}>
                                                      {items[1]}
                                                    </a>
                                                  </li>
                                                );
                                              }
                                            )}
                                            <div class={styles.arrow} />
                                          </ul>
                                        </div>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                              <div class={styles.arrow} />
                            </ul>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div class={styles.logoutSign}>
              <a
                class={[styles.button, styles.transparent]}
                onClick$={() => signOut.submit({})}
              >
                登出
              </a>
            </div>
          </div>

          <div class={styles.hamburgerMenuContainer}>
            <div class={styles.hamburgerMenu}>
              <div />
            </div>
          </div>
        </div>
      </nav>
      <main>
        <section class={styles.body} id="mainpage">
          <Slot />
        </section>
      </main>
    </>
  );
});
