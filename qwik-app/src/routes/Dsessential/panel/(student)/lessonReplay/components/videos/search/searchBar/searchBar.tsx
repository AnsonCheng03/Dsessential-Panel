import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./searchBar.module.css";
import { AutoCompleteBox } from "./reactSearchBar";

export default component$(
  ({
    searchValue,
    availableVideos,
  }: {
    searchValue: Signal<string>;
    availableVideos: string[];
  }) => {
    return (
      <div class={styles.searchBar}>
        <AutoCompleteBox
          availableVideos={availableVideos}
          searchValue={searchValue}
        />
      </div>
    );
  },
);
