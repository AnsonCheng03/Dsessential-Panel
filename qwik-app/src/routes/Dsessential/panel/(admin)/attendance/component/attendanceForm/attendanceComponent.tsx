import {
  component$,
  useSignal,
  $,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import styles from "./attendanceComponent.module.css";
import { Toggle } from "~/components/react/ToggleButton";
import { globalAction$ } from "@builder.io/qwik-city";

export const useFormSubmit = globalAction$(async (input, requestEvent) => {
  const output: Record<string, any> = {};

  for (const key in input) {
    const [prefix, suffix] = key.split("_");

    if (output[prefix]) {
      if (Array.isArray(output[prefix])) {
        output[prefix].push(input[key]);
      } else {
        output[prefix] = [output[prefix] as string, input[key]];
      }
    } else {
      if (suffix === undefined) {
        output[prefix] = input[key];
      } else {
        output[prefix] = [input[key]];
      }
    }
  }

  output["ipAddress"] = requestEvent.clientConn.ip;

  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/attendance/sendForm`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${
            requestEvent.sharedMap.get("session").accessToken
          }`,
        },
        body: JSON.stringify(output),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return { error: "error" };
  }
});

export const useFormDelete = globalAction$(async (input, requestEvent) => {
  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/attendance/deleteForm`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${
            requestEvent.sharedMap.get("session").accessToken
          }`,
        },
        body: JSON.stringify({
          deleteRow: input.deleteRow,
          ipAddress: requestEvent.clientConn.ip,
        }),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return "error";
  }
});

export default component$(
  ({
    options,
    formAmount,
  }: {
    options: string[];
    formAmount: Signal<number>;
  }) => {
    const searchValue = useSignal("");
    const studentStatus = useSignal("出席");
    const homeworkCount = useSignal("0");
    const lessonCount = useSignal("1");
    const paymentMethod = useSignal("無");
    const paymentAmount = useSignal("720");
    const otherItems = useSignal(["無限Video"]);
    const otherItemsDetails = useSignal<string[]>([]);
    const otherItemsAmount = useSignal("");
    const discountAmount = useSignal("50");
    const formId = useSignal(`form${Date.now()}`);

    const formLoading = useSignal(false);
    const formDeleted = useSignal(false);
    const rowNumber = useSignal<null | string>(null);
    const studentData = useSignal<false | string>(false);

    useVisibleTask$(() => {
      setTimeout(() => {
        document
          .querySelector<HTMLInputElement>(`.${styles.studentDetails} input`)
          ?.focus();
      }, 50);
    });

    const submitToServer = useFormSubmit();
    const deleteFromServer = useFormDelete();

    const formSubmit = $(async (target: HTMLFormElement) => {
      const formData = new FormData(target);
      if (formData.get("studentName") === "") return;

      formLoading.value = true;
      if (!rowNumber.value) formAmount.value++;
      const { value } = await submitToServer.submit(formData);
      studentData.value = value.studentData;
      rowNumber.value = value.rowNumber;
      formLoading.value = false;
    });

    const handleFormSubmit = $((e: any) => {
      formSubmit(e.target);
    });

    useVisibleTask$(async ({ track }) => {
      track(() => searchValue.value);
      track(() => studentStatus.value);
      track(() => homeworkCount.value);
      track(() => lessonCount.value);
      track(() => paymentMethod.value);
      track(() => paymentAmount.value);
      track(() => otherItems.value);
      track(() => otherItemsDetails.value);
      track(() => otherItemsAmount.value);
      track(() => discountAmount.value);

      const formElement = document.querySelector<HTMLFormElement>(
        `#${formId.value}`
      );
      if (rowNumber.value) formSubmit(formElement!);
    });

    const handleDelete = $(async () => {
      formLoading.value = true;
      const { value } = await deleteFromServer.submit({
        deleteRow: rowNumber.value,
      });
      if (value.status === "success") formDeleted.value = true;
    });

    return (
      <form
        class={
          formDeleted.value
            ? [styles.container, styles.hidden]
            : styles.container
        }
        preventdefault:submit
        onSubmit$={handleFormSubmit}
        id={formId.value}
      >
        {formLoading.value && <div class={styles.loading} />}
        {rowNumber.value && (
          <input
            type="hidden"
            name="rowNumber"
            bind:value={rowNumber as Signal<string>}
          />
        )}
        <div
          class={
            rowNumber.value
              ? [styles.containerRows, styles.studentDetails, styles.doneSubmit]
              : [styles.containerRows, styles.studentDetails]
          }
        >
          <AutoCompleteBox
            size="small"
            searchValue={searchValue}
            options={options}
            freeSolo
            placeholder="卡號/姓名/電話號碼"
          />
          <input type="hidden" bind:value={searchValue} name="studentName" />
          <div
            class={
              studentData.value
                ? styles.statusBox
                : [styles.statusBox, styles.notFound]
            }
          >
            {studentData.value ? studentData.value : "找不到"}
          </div>
          <Toggle
            selectValue={studentStatus.value}
            onChange$={(v) => (studentStatus.value = v)}
            options={["缺席", "出席", "請假"]}
          />
          <input
            type="hidden"
            bind:value={studentStatus}
            name="studentStatus"
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
            <input
              type="hidden"
              bind:value={homeworkCount}
              name="homeworkCount"
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
              <input
                type="hidden"
                bind:value={lessonCount}
                name="lessonCount"
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
            <input
              type="hidden"
              bind:value={paymentMethod}
              name="paymentMethod"
            />
            {paymentMethod.value !== "無" && (
              <>
                <Toggle
                  selectValue={paymentAmount.value}
                  onChange$={(v) => (paymentAmount.value = v)}
                  options={[
                    "600",
                    "620",
                    "650",
                    "700",
                    "720",
                    "750",
                    "800",
                    "900",
                  ]}
                  inputOption="其他"
                />
                <input
                  type="hidden"
                  bind:value={paymentAmount}
                  name="paymentAmount"
                />
              </>
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
            <div class={styles.hidden}>
              <input
                type="checkbox"
                name="otherItems_0"
                value="無限Video"
                checked={otherItems.value.includes("無限Video")}
              />
              <input
                type="checkbox"
                name="otherItems_1"
                value="其他項目"
                checked={otherItems.value.includes("其他項目")}
              />
              <input
                type="checkbox"
                name="otherItems_2"
                value="折扣"
                checked={otherItems.value.includes("折扣")}
              />
            </div>
          </div>
          {rowNumber.value ? (
            <button
              type="button"
              class={styles.removeButton}
              onClick$={handleDelete}
            >
              刪除
            </button>
          ) : (
            <button type="submit" class={styles.submitButton}>
              提交
            </button>
          )}
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
              <div class={styles.hidden}>
                <input
                  type="checkbox"
                  name="otherItemsDetails_0"
                  value="模擬試"
                  checked={otherItemsDetails.value.includes("模擬試")}
                />
                <input
                  type="checkbox"
                  name="otherItemsDetails_1"
                  value="操卷班"
                  checked={otherItemsDetails.value.includes("操卷班")}
                />
                <input
                  type="checkbox"
                  name="otherItemsDetails_2"
                  value="範文班"
                  checked={otherItemsDetails.value.includes("範文班")}
                />
                <input
                  type="checkbox"
                  name="otherItemsDetails_3"
                  value="寫作班"
                  checked={otherItemsDetails.value.includes("寫作班")}
                />
                <input
                  type="checkbox"
                  name="otherItemsDetails_4"
                  value="補課附加費"
                  checked={otherItemsDetails.value.includes("補課附加費")}
                />
              </div>
            </div>
            <input
              class={styles.otherItemsAmount}
              bind:value={otherItemsAmount}
              name="otherItemsAmount"
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
              <input
                type="hidden"
                bind:value={discountAmount}
                name="discount"
              />
            </div>
          </div>
        )}
      </form>
    );
  }
);
