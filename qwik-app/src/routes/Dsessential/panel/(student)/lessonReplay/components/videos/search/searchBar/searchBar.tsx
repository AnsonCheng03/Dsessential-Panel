import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./searchBar.module.css";
import { qwikify$ } from "@builder.io/qwik-react";
import { TextField, InputAdornment } from "@mui/material";

export const MUITextField = qwikify$(TextField);
export const MUIInputAdornment = qwikify$(InputAdornment);

export default component$(
  ({ searchValue }: { searchValue: Signal<string> }) => {
    return (
      <div class={styles.searchBar}>
        <MUITextField
          fullWidth
          placeholder="搜尋影片"
          onChange$={(e) => {
            searchValue.value = e.target.value;
          }}
          client:visible
        />
      </div>
    );
  }
);
