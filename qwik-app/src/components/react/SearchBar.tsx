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
    size,
    freeSolo,
    disabled = false,
  }: {
    searchValue: Signal<string>;
    options: string[];
    placeholder: string;
    size?: "small" | "medium";
    freeSolo?: boolean;
    disabled?: boolean;
  }) => {
    return (
      <Autocomplete
        disablePortal
        size={size}
        freeSolo={freeSolo}
        disableClearable
        disabled={disabled}
        options={[...new Set(options)]}
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
  },
);
