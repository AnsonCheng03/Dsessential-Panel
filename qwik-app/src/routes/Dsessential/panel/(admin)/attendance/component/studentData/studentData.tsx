import { component$, useSignal } from "@builder.io/qwik";
import {
  BsChevronLeft,
  BsChevronRight,
  BsFileEarmarkSpreadsheet,
} from "@qwikest/icons/bootstrap";
import styles from "./studentData.module.css";

export default component$(() => {
  const linkData = [
    {
      name: "學生資料篩選器",
      link: "https://docs.google.com/spreadsheets/d/1V5SY55VS3JIfFkhHHKBWWQbO_aqU9Jc6FDWUq7b6xOg/",
      frame:
        "https://docs.google.com/spreadsheets/d/1V5SY55VS3JIfFkhHHKBWWQbO_aqU9Jc6FDWUq7b6xOg/edit?usp=sharing&rm=minimal",
    },
    {
      name: "學生報到機",
      link: "https://docs.google.com/spreadsheets/d/11pFx0c2MjCMZYq6O2VTN4g9vUijw7mtCbXqiOvfctJ8",
      frame:
        "https://docs.google.com/spreadsheets/d/11pFx0c2MjCMZYq6O2VTN4g9vUijw7mtCbXqiOvfctJ8/edit?usp=sharing&rm=minimal",
    },
  ];
  const currentIndex = useSignal(0);

  return (
    <div class={styles.studentData}>
      <div class={styles.header}>
        <div class={styles.headerNav}>
          <div
            class={styles.headerNavButton}
            onClick$={() => {
              currentIndex.value = currentIndex.value - 1;
              if (currentIndex.value < 0)
                currentIndex.value = linkData.length - 1;
            }}
          >
            <BsChevronLeft />
          </div>
          <div class={styles.headerNavItem}>
            {linkData[currentIndex.value].name}
          </div>
          <div
            class={styles.headerNavButton}
            onClick$={() => {
              currentIndex.value = currentIndex.value + 1;
              if (currentIndex.value >= linkData.length) currentIndex.value = 0;
            }}
          >
            <BsChevronRight />
          </div>
        </div>
        <a href={linkData[currentIndex.value].link} target="_blank">
          <div class={styles.headerRedirect}>
            <BsFileEarmarkSpreadsheet />
          </div>
        </a>
      </div>
      <iframe
        class={styles.studentDataIframe}
        src={linkData[currentIndex.value].frame}
      />
    </div>
  );
});
