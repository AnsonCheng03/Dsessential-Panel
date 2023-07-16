import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./filter.module.css";

export default component$(
  ({
    selectedType,
    selectedMonth,
    availableMonth,
    searchValue,
  }: {
    selectedType: Signal<string>;
    selectedMonth: Signal<string | null>;
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
          <div class={styles.yearDescription}>類別</div>
          <div class={styles.yearSelection}>
            {availableMonth.map((year) => {
              return (
                <div
                  key={year[0] as string}
                  class={
                    selectedType.value === year[0]
                      ? [styles.yearSelect, styles.Selected]
                      : styles.yearSelect
                  }
                  onClick$={() => {
                    selectedType.value = year[0] as string;
                    if (selectedMonth.value !== null)
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
          <div class={styles.monthDescription}>篩選</div>
          <div class={styles.monthSelection}>
            {availableMonth.map((year) => {
              if (year[0] === selectedType.value)
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
                            if (selectedMonth.value === month)
                              selectedMonth.value = null;
                            else selectedMonth.value = month;
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
