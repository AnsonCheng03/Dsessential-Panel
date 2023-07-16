/** @jsxImportSource react */
import * as React from "react";
import { qwikify$ } from "@builder.io/qwik-react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export const Toggle = qwikify$(
  function Toggle({
    selectValue,
    onChange,
    options,
    inputOption,
  }: {
    selectValue: string;
    onChange: (v: string) => any;
    options: string[];
    inputOption?: string;
  }) {
    const [inputValue, setInputValue] = React.useState(false);
    return (
      <ToggleButtonGroup
        color="primary"
        exclusive
        fullWidth
        value={selectValue}
        onChange={(_e, v) => {
          v && onChange(v);
          v && setInputValue(false);
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option} value={option}>
            {option}
          </ToggleButton>
        ))}
        {inputOption && (
          <ToggleButton value="input">
            <input
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "rgba(0, 0, 0, 0.54);",
                textAlign: "center",
              }}
              placeholder={inputOption}
              value={inputValue ? selectValue : ""}
              onChange={(e) => {
                onChange(e.target.value);
                e.target.value && setInputValue(true);
              }}
            />
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    );
  },
  {
    eagerness: "hover",
  }
);
