import { component$, useSignal } from "@builder.io/qwik";
import styles from "./search.module.css";
import Filter from "./filter/filter";
import SearchBar from "./searchBar/searchBar";

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
  const searchValue = useSignal("");
  const selectedYear = useSignal(availableMonth[0][0] as string);
  const selectedMonth = useSignal(availableMonth[0][1][0] as string);

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
});
