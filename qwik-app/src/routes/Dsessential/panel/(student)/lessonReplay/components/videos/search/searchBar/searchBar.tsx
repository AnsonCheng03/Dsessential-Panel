import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./searchBar.module.css";
import { AutoCompleteBox } from "~/components/react/SearchBar";

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
          options={availableVideos}
          searchValue={searchValue}
          placeholder="搜尋影片"
        />
      </div>
    );
  },
);
