import type { Signal } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import styles from "./search.module.css";
import Filter from "./filter/filter";
import SearchBar from "./searchBar/searchBar";

export default component$(
  ({
    availableMonth,
    selectedMonth,
    selectedType,
    availableVideos,
    searchValue,
  }: {
    availableVideos: string[];
    availableMonth: (string | string[])[][];
    selectedType: Signal<string>;
    selectedMonth: Signal<string | null>;
    searchValue: Signal<string>;
  }) => {
    useTask$(({ track }) => {
      track(() => searchValue.value);
      selectedMonth.value = null;
    });
    return (
      <div class={styles.search}>
        <SearchBar
          searchValue={searchValue}
          availableVideos={availableVideos}
        />
        <Filter
          searchValue={searchValue}
          selectedType={selectedType}
          selectedMonth={selectedMonth}
          availableMonth={availableMonth}
        />
      </div>
    );
  },
);
