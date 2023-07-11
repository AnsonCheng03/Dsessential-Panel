import { Signal, component$, useSignal } from "@builder.io/qwik";
import styles from "./search.module.css";
import Filter from "./filter/filter";
import SearchBar from "./searchBar/searchBar";

export default component$(
  ({
    availableMonth,
    selectedMonth,
    selectedYear,
  }: {
    availableMonth: (string | string[])[][];
    selectedMonth: Signal<string>;
    selectedYear: Signal<string>;
  }) => {
    const searchValue = useSignal("");

    return (
      <div class={styles.search}>
        <SearchBar searchValue={searchValue} />
        <Filter
          searchValue={searchValue}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          availableMonth={availableMonth}
        />
      </div>
    );
  }
);
