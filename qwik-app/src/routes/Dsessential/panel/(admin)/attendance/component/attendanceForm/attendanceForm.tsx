import { component$, useSignal } from "@builder.io/qwik";
import AttendanceComponent from "./attendanceComponent";
import styles from "./attendanceForm.module.css";
// import { Alert } from "@mui/material";
// import { qwikify$ } from "@builder.io/qwik-react";

// const MUIAlert = qwikify$(Alert);

export default component$(({ options }: { options: any }) => {
  // make options from object to array
  let newOptions: string[] = [];
  options.map((option: any) => {
    if (option.SID) newOptions.push(option.SID);
    if (option.姓名) newOptions.push(option.姓名);
    if (option.學生電話) newOptions.push(option.學生電話);
  });
  newOptions = [...new Set(newOptions)];

  const formAmount = useSignal(1);

  return (
    <>
      <div>
        <div class={styles.alert}>
          {/* <MUIAlert severity="warning">
            如果上面有空白行，入新資料有機會去左最頂嘅空白行而唔係最底。會盡快處理～
            [Issue status: Noticed, Not Urgent]
          </MUIAlert> */}
        </div>
        {Array.from(Array(formAmount.value).keys())
          .reverse()
          .map((i) => (
            <AttendanceComponent
              options={newOptions}
              key={i}
              formAmount={formAmount}
            />
          ))}
      </div>
    </>
  );
});
