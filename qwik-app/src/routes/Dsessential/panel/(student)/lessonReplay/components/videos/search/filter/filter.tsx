import { component$, useSignal } from "@builder.io/qwik";
import styles from "./filter.module.css";

const availableMonth = [
  [
    "2022",
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  ],
  ["2023", ["Jan"]],
];

export default component$(() => {
  const selectedYear = useSignal(availableMonth[0][0]);
  const selectedMonth = useSignal(availableMonth[0][1][0]);

  return (
    <>
      <div class={styles.dateFilter}>
        <div class={styles.yearContainer}>
          <div class={styles.yearDescription}>年份</div>
          <div class={styles.yearSelection}>
            {availableMonth.map((year) => {
              return (
                <div
                  key={year[0] as string}
                  class={
                    selectedYear.value === year[0]
                      ? [styles.yearSelect, styles.Selected]
                      : styles.yearSelect
                  }
                  onClick$={() => {
                    selectedYear.value = year[0];
                    selectedMonth.value = year[1][0];
                  }}
                >
                  {year[0]}
                </div>
              );
            })}
          </div>
        </div>

        <div class={styles.monthContainer}>
          <div class={styles.monthDescription}>月份</div>
          <div class={styles.monthSelection}>
            {availableMonth.map((year) => {
              if (year[0] === selectedYear.value)
                return (
                  <>
                    {(year[1] as string[]).map((month) => {
                      return (
                        <div
                          key={`${year[0]}_${month}`}
                          class={
                            selectedMonth.value === month
                              ? [styles.monthSelect, styles.Selected]
                              : styles.monthSelect
                          }
                          onClick$={() => {
                            selectedMonth.value = month;
                          }}
                        >
                          {month}
                        </div>
                      );
                    })}
                  </>
                );
            })}
          </div>
        </div>
      </div>
    </>
  );
});
