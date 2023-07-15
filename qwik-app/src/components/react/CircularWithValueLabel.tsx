/** @jsxImportSource react */
import * as React from "react";
import { qwikify$ } from "@builder.io/qwik-react";
import {
  Box,
  Typography,
  CircularProgress,
  type CircularProgressProps,
} from "@mui/material";

export const CircularWithValueLabel = qwikify$(
  (props: CircularProgressProps & { value: number }) => {
    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  },
  {
    eagerness: "visible",
  }
);
