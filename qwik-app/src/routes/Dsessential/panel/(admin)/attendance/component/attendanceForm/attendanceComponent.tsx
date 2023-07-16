import { component$, useSignal } from "@builder.io/qwik";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import styles from "./attendanceComponent.module.css";
import { Toggle } from "~/components/react/ToggleButton";

export default component$(({ options }: { options: string[] }) => {
  const searchValue = useSignal("");
  const studentStatus = useSignal("出席");
  const homeworkCount = useSignal("0");

  return (
    <>
      <div class={styles.container}>
        <div class={[styles.containerRows, styles.studentDetails]}>
          <AutoCompleteBox
            searchValue={searchValue}
            options={options}
            placeholder="請選擇學生"
          />
          <Toggle
            selectValue={studentStatus.value}
            onChange$={(v) => (studentStatus.value = v)}
            options={["缺席", "出席", "請假"]}
          />
        </div>
        <div class={[styles.containerRows, styles.lessonDetails]}>
          <div class={styles.containerBox}>
            <span>功課</span>
            <Toggle
              selectValue={homeworkCount.value}
              onChange$={(v) => (homeworkCount.value = v)}
              options={["0", "1", "2"]}
              inputOption="其他"
            />
          </div>
        </div>
      </div>
    </>
  );
});
