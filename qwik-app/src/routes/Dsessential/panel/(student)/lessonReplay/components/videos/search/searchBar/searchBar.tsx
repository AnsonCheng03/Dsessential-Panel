import { component$, useSignal } from "@builder.io/qwik";
import styles from "./searchBar.module.css";
import { BsSearch } from "@qwikest/icons/bootstrap";
import { qwikify$ } from "@builder.io/qwik-react";
import { TextField, InputAdornment } from "@mui/material";

export const MUITextField = qwikify$(TextField);
export const MUIInputAdornment = qwikify$(InputAdornment);

export default component$(() => {
  const searchValue = useSignal("");
  return (
    <div class={styles.searchBar}>
      <MUITextField
        fullWidth
        placeholder="搜尋影片"
        value={searchValue.value}
      />
    </div>
  );
});
