import { component$, useSignal } from "@builder.io/qwik";
import styles from "./navBar.module.css";
import { Link } from "@builder.io/qwik-city";
import { useAuthSignout } from "~/routes/plugin@auth";

export default component$(({ navlist }: { navlist: any }) => {
  const baseURL = "/Dsessential";
  const signOut = useAuthSignout();

  const openNav = useSignal(false);

  return (
    <nav class={styles.header}>
      <div class={styles.container}>
        <div class={styles.navItems}>
          <div class={styles.logoContainer}>
            <h3 class={styles.logo}>
              <Link href={baseURL} class={styles.whiteLink}>
                DSE<span>ssential</span>
              </Link>
            </h3>
          </div>

          <div
            class={
              openNav.value
                ? [styles.navLinks, styles.navLinksActive]
                : styles.navLinks
            }
          >
            {navlist.map((item: any) => {
              return (
                <ul class={styles.navList} key={item[1]}>
                  <li>
                    {item[0] == "Item" ? (
                      <Link href={baseURL + item[2]}>{item[1]}</Link>
                    ) : (
                      item[1]
                    )}
                  </li>
                  {item[0] == "List" && (
                    <li>
                      {item[3].map((subItem: any) => {
                        return (
                          <ul class={styles.navSubList} key={subItem[1]}>
                            <li>
                              {subItem[0] == "Item" ? (
                                <Link href={baseURL + subItem[2]}>
                                  {subItem[1]}
                                </Link>
                              ) : (
                                subItem[1]
                              )}
                            </li>
                            {subItem[0] == "List" &&
                              subItem[3].map((subsubItem: any) => {
                                return (
                                  <ul
                                    class={styles.navSubSubList}
                                    key={subsubItem[1]}
                                  >
                                    <li>
                                      <Link href={baseURL + subsubItem[2]}>
                                        {subsubItem[1]}
                                      </Link>
                                    </li>
                                  </ul>
                                );
                              })}
                          </ul>
                        );
                      })}
                    </li>
                  )}
                </ul>
              );
            })}
          </div>

          <div class={styles.navSigns}>
            <div class={styles.logoutSign}>
              <button onClick$={() => signOut.submit({})}>登出</button>
            </div>
            <div
              class={
                openNav.value
                  ? [styles.navSign, styles.navSignActive]
                  : styles.navSign
              }
            >
              <button
                onClick$={() => {
                  openNav.value = !openNav.value;
                }}
              >
                導覽
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});
