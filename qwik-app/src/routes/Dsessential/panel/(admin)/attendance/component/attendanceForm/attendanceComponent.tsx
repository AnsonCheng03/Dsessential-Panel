import { component$, useSignal } from "@builder.io/qwik";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import styles from "./attendanceComponent.module.css";
import { Toggle } from "~/components/react/ToggleButton";
import { Form } from "@builder.io/qwik-city";

export default component$(({ options }: { options: string[] }) => {
  const searchValue = useSignal("");
  const studentStatus = useSignal("出席");
  const homeworkCount = useSignal("0");
  const lessonCount = useSignal("1");
  const paymentMethod = useSignal("上門支付");
  const paymentAmount = useSignal("720");
  const otherItems = useSignal(["無限Video"]);
  const otherItemsDetails = useSignal([]);
  const otherItemsAmount = useSignal("");
  const discountAmount = useSignal("50");

  return (
    <Form class={styles.container} onSubmit$={(e) => e.preventDefault()}>
      <div class={[styles.containerRows, styles.studentDetails]}>
        <AutoCompleteBox
          size="small"
          searchValue={searchValue}
          options={options}
          placeholder="卡號/姓名/電話號碼"
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
        {studentStatus.value === "出席" && (
          <div class={styles.containerBox}>
            <span>上課堂數</span>
            <Toggle
              selectValue={lessonCount.value}
              onChange$={(v) => (lessonCount.value = v)}
              options={["0", "1", "2"]}
              inputOption="其他"
            />
          </div>
        )}
      </div>
      <div class={[styles.containerRows]}>
        <div class={styles.containerBox}>
          <span>繳付學費</span>
          <Toggle
            selectValue={paymentMethod.value}
            onChange$={(v) => (paymentMethod.value = v)}
            options={["無", "線上支付", "上門支付"]}
          />
          {paymentMethod.value !== "無" && (
            <Toggle
              selectValue={paymentAmount.value}
              onChange$={(v) => (paymentAmount.value = v)}
              options={["600", "620", "650", "700", "720", "750", "800", "900"]}
              inputOption="其他"
            />
          )}
        </div>
      </div>
      <div class={[styles.containerRows, styles.otherItems]}>
        <div class={styles.containerBox}>
          <span>其他</span>
          <Toggle
            selectValue={otherItems.value}
            multiSelection
            onChange$={(v: any) => (otherItems.value = v)}
            options={["無限Video", "其他項目", "折扣"]}
          />
        </div>
        <input type="submit" class={styles.submitButton} value={"提交"} />
      </div>
      {otherItems.value.includes("其他項目") && (
        <div class={[styles.containerRows, styles.otherItems]}>
          <div class={styles.containerBox}>
            <span>其他項目</span>
            <Toggle
              selectValue={otherItemsDetails.value}
              multiSelection
              onChange$={(v: any) => (otherItemsDetails.value = v)}
              options={["模擬試", "操卷班", "範文班", "寫作班", "補課附加費"]}
            />
          </div>
          <input
            class={styles.otherItemsAmount}
            bind: value={otherItemsAmount}
            placeholder="總價錢"
          />
        </div>
      )}
      {otherItems.value.includes("折扣") && (
        <div class={[styles.containerRows]}>
          <div class={styles.containerBox}>
            <span>折扣</span>
            <Toggle
              selectValue={discountAmount.value}
              onChange$={(v) => (discountAmount.value = v)}
              options={["20", "50", "70", "120"]}
              inputOption="其他"
            />
          </div>
        </div>
      )}
    </Form>
  );
});
