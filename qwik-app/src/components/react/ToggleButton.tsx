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
    multiSelection = false,
  }: {
    selectValue: string | string[];
    onChange: (v: string) => any;
    options: string[];
    inputOption?: string;
    multiSelection?: boolean;
  }) {
    const [inputValue, setInputValue] = React.useState(false);

    function isNumeric(str: any) {
      if (typeof str != "string") return false; // we only process strings!
      return (
        !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
      ); // ...and ensure strings of whitespace fail
    }

    return (
      <ToggleButtonGroup
        color="primary"
        size="small"
        fullWidth
        exclusive={!multiSelection}
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
          <ToggleButton
            value={
              isNumeric(options[options.length - 1])
                ? parseInt(options[options.length - 1]) + 1
                : options[0]
            }
          >
            <input
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: inputValue ? "#1976d2" : "rgba(0, 0, 0, 0.54)",
                fontSize: "0.8125rem",
                textAlign: "center",
                textDecoration: inputValue ? "underline" : "none",
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
  },
);
