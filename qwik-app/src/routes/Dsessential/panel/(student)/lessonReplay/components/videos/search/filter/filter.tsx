import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./filter.module.css";

export default component$(
  ({
    selectedYear,
    selectedMonth,
    availableMonth,
    searchValue,
  }: {
    selectedYear: Signal<string>;
    selectedMonth: Signal<string>;
    availableMonth: (string | string[])[][];
    searchValue: Signal<string>;
  }) => {
    return (
      <div
        class={
          searchValue.value === ""
            ? styles.dateFilter
            : [styles.hidden, styles.dateFilter]
        }
      >
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
                    selectedYear.value = year[0] as string;
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
    );
  }
);
