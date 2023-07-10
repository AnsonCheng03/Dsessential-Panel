import { component$ } from "@builder.io/qwik";
import styles from "./search.module.css";
import Filter from "./filter/filter";

export default component$(() => {
  return (
    <div class={styles.search}>
      <Filter />
    </div>
  );
});
