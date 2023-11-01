import { component$ } from "@builder.io/qwik";
import styles from "./navBar.module.css";
import { Link } from "@builder.io/qwik-city";
import { useAuthSignout } from "~/routes/plugin@auth";

export default component$(({ navlist }: { navlist: any }) => {
  const baseURL = "/Dsessential";
  const signOut = useAuthSignout();

  return (
    <nav class={styles.header}>
      <div class={styles.container}>
        <input type="checkbox" class={styles.mobileCheck} />

        <div class={styles.logoContainer}>
          <h3 class={styles.logo}>
            <Link href={baseURL} class={styles.whiteLink}>
              DSE<span>ssential</span>
            </Link>
          </h3>
        </div>

        <div class={styles.navButton}>
          <div class={styles.navLinks}>
            <ul class={styles.navList}>
              {navlist.map((items: any) => {
                return (
                  <li class={styles.navLink} key={items[1] as string}>
                    {items[0] == "Item" && (
                      <Link
                        href={
                          ((items[2].toLowerCase().startsWith("http")
                            ? ""
                            : baseURL) + items[2]) as string
                        }
                      >
                        {items[1]}
                      </Link>
                    )}
                    {items[0] == "List" && (
                      <>
                        <Link
                          href={
                            ((items[2].toLowerCase().startsWith("http")
                              ? ""
                              : baseURL) + items[2]) as string
                          }
                        >
                          {items[1]}
                        </Link>
                        <div class={styles.dropdown}>
                          <ul class={styles.navList}>
                            {items[3].map((items: any) => {
                              return (
                                <li
                                  class={styles.dropdownLink}
                                  key={items[1] as string}
                                >
                                  {items[0] == "Item" && (
                                    <Link
                                      href={
                                        ((items[2]
                                          .toLowerCase()
                                          .startsWith("http")
                                          ? ""
                                          : baseURL) + items[2]) as string
                                      }
                                    >
                                      {items[1]}
                                    </Link>
                                  )}
                                  {items[0] == "List" && (
                                    <>
                                      <Link
                                        href={
                                          ((items[2]
                                            .toLowerCase()
                                            .startsWith("http")
                                            ? ""
                                            : baseURL) + items[2]) as string
                                        }
                                      >
                                        {items[1]}
                                      </Link>
                                      <div
                                        class={[styles.dropdown, styles.second]}
                                      >
                                        <ul class={styles.navList}>
                                          {items[3]?.map((items: string[]) => {
                                            return (
                                              <li
                                                class={styles.dropdownLink}
                                                key={items[1]}
                                              >
                                                <Link
                                                  href={
                                                    ((items[2]
                                                      .toLowerCase()
                                                      .startsWith("http")
                                                      ? ""
                                                      : baseURL) +
                                                      items[2]) as string
                                                  }
                                                >
                                                  {items[1]}
                                                </Link>
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
            <button
              class={[styles.button, styles.transparent]}
              onClick$={() => signOut.submit({})}
            >
              登出
            </button>
          </div>
        </div>

        <div class={styles.hamburgerMenuContainer}>
          <div class={styles.hamburgerMenu}>
            <div />
          </div>
        </div>
      </div>
    </nav>
  );
});
