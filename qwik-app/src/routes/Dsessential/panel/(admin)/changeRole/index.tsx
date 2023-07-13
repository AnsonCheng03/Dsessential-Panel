import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { AutoCompleteBox } from "~/components/autoComplete/reactSearchBar";
import { SelectBox } from "./reactSelectBox";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useGetAllUser = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.BACKEND_ADDRESS}:3500/users/getAllUsers`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    if (data.statusCode) throw data;
    const returnData: string[][] = [[], [], []];
    data.map((obj: any) => {
      if (Object.values(obj)[0])
        returnData[0].push(Object.values(obj)[0] as string);
      if (Object.values(obj)[1])
        returnData[1].push(Object.values(obj)[1] as string);
      if (Object.values(obj)[2])
        returnData[2].push(Object.values(obj)[2] as string);
    });
    return returnData;
  } catch (error) {
    console.log(error);
    return ["發生錯誤"];
  }
});

export default component$(() => {
  const selectValue = useSignal("SID");
  const searchValue = useSignal("");
  const options = useGetAllUser().value;

  console.log(options[1]);

  return (
    <>
      <div class={styles.switchUserSelection}>
        <SelectBox
          selectValue={selectValue}
          options={["SID", "姓名", "電話"]}
          placeholder="類型"
        />
        <AutoCompleteBox
          searchValue={searchValue}
          options={
            options[
              selectValue.value === "SID"
                ? 0
                : selectValue.value === "姓名"
                ? 1
                : 2
            ] as string[]
          }
          placeholder="請選擇學生"
        />
        <button class={styles.switchUserButton}>切換</button>
      </div>
      <iframe
        sandbox="allow-scripts allow-same-origin"
        class={styles.switchUserFrame}
        src="/Dsessential"
        // onLoad$={iFrameLoaded}
      ></iframe>
    </>
  );
});
