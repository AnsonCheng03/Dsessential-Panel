import { component$, useSignal } from "@builder.io/qwik";
import AttendanceComponent from "./attendanceComponent";
import styles from "./attendanceForm.module.css";

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
        <div class={styles.alert}></div>
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
