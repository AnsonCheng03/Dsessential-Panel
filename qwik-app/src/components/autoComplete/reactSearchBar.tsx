/** @jsxImportSource react */
import * as React from "react";
import { type Signal } from "@builder.io/qwik";
import { qwikify$ } from "@builder.io/qwik-react";
import { Autocomplete, TextField } from "@mui/material";

export const AutoCompleteBox = qwikify$(
  ({
    searchValue,
    options,
    placeholder,
  }: {
    searchValue: Signal<string>;
    options: string[];
    placeholder: string;
  }) => {
    return (
      <Autocomplete
        disablePortal
        options={[...new Set(options)]}
        onChange={(e, value) => {
          if (value) searchValue.value = value;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={placeholder}
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
  }
);
