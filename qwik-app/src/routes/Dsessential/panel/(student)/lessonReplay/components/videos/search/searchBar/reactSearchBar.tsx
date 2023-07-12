/** @jsxImportSource react */
import * as React from "react";
import { type Signal } from "@builder.io/qwik";
import { qwikify$ } from "@builder.io/qwik-react";
import { Autocomplete, TextField } from "@mui/material";

export const AutoCompleteBox = qwikify$(
  ({
    searchValue,
    availableVideos,
  }: {
    searchValue: Signal<string>;
    availableVideos: string[];
  }) => {
    return (
      <Autocomplete
        disablePortal
        options={[...new Set(availableVideos)]}
        onChange={(e, value) => {
          if (value) searchValue.value = value;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="搜尋影片"
            onChange={(e) => {
              searchValue.value = e.target.value;
            }}
          />
        )}
      />
    );
  },
  {
    eagerness: "visible",
  },
);
