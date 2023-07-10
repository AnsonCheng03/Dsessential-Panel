import { component$ } from "@builder.io/qwik";
import styles from "./search.module.css";
import Filter from "./filter/filter";
import SearchBar from "./searchBar/searchBar";

export default component$(() => {
  return (
    <div class={styles.search}>
      <SearchBar />
      <Filter />
    </div>
  );
});
