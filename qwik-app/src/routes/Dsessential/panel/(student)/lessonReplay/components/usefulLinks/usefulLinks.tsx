import { component$ } from "@builder.io/qwik";
import styles from "./usefulLinks.module.css";

const links = [
  [
    "課程答案及資源",
    "https://drive.google.com/drive/folders/1Hn6IVECyUB-xK33C2Jm4TbyfTJaiPEQe?usp=sharing",
  ],
  ["網上補課錄影", "https://zfrmz.com/ODaQqMopJx8WENu1zo5E"],
  [
    "互動教室",
    "https://zoom.us/j/2973131817?pwd=VzNQa3orK1ZscFIyd3RNdk81YmtpUT09",
  ],
  [
    "自助出席紀錄查詢",
    "https://docs.google.com/spreadsheets/d/1UqdFNpOX6pks1HCA8uquhFVUc4za71rEdPR33kjBMrI/edit?usp=sharing",
  ],
  ["網上交功課", "http://wa.link/4ogjli"],
];

export default component$(() => {
  return (
    <div class={styles.usefulLinks}>
      <h2 class={styles.title}>有用連結</h2>
      <div class={styles.container}>
        {links.map((link) => (
          <a class={styles.links} key={link[0]} href={link[1]}>
            {link[0]}
          </a>
        ))}
      </div>
    </div>
  );
});
