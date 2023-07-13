/** @jsxImportSource react */
import * as React from "react";
import { type Signal } from "@builder.io/qwik";
import { qwikify$ } from "@builder.io/qwik-react";
import { Select, MenuItem } from "@mui/material";

export const SelectBox = qwikify$(
  ({
    selectValue,
    options,
    placeholder,
  }: {
    selectValue: Signal<string>;
    options: string[];
    placeholder: string;
  }) => {
    return (
      <Select
        onChange={(e) => {
          if (e.target.value) (selectValue as any).value = e.target.value;
        }}
        defaultValue={selectValue.value}
        displayEmpty
        label={placeholder}
      >
        {options.map((option) => (
          <MenuItem value={option}>{option}</MenuItem>
        ))}
      </Select>
    );
  },
  {
    eagerness: "visible",
  }
);
