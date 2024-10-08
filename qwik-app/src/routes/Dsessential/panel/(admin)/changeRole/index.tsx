import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import { SelectBox } from "../../../../../components/react/SelectBox";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import Prompt from "~/components/prompt/prompt";

export const useGetAllUser = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.INTERNAL_BACKEND}/users/getAllUsers`,
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
    return data;
  } catch (error) {
    console.log(error);
    return ["發生錯誤"];
  }
});

export default component$(() => {
  const session = useAuthSession();
  const accessToken = (session.value as any).accessToken;
  const selectValue = useSignal("SID");
  const searchValue = useSignal("");
  const errorBox = useSignal(false);
  const iframeURL = useSignal("");
  const location = useLocation();

  const options = useGetAllUser().value;
  const groupOptions: string[][] = [[], [], []];
  if (options[0] === "發生錯誤") {
    groupOptions[0].push("發生錯誤");
    groupOptions[1].push("發生錯誤");
    groupOptions[2].push("發生錯誤");
  } else
    options.map((obj: any) =>
      Object.values(obj).forEach(
        (value, index) => value && groupOptions[index].push(value as string)
      )
    );

  const clickSwitchUser = $(async () => {
    const getStudent = (key: string, value: string) =>
      options.find((obj: any) => obj[key] === value);
    const SID = getStudent(
      selectValue.value,
      (
        document?.querySelector(
          `.${styles.switchUserSelection} input[type="text"]`
        ) as HTMLInputElement
      )?.value || searchValue.value
    )?.SID;
    if (!SID) {
      errorBox.value = true;
      return;
    }
    if (location.url.hostname == "nas.dsessential.com")
      iframeURL.value = `https://mirror.dsessential.com/Dsessential/panel/changeRole/iframeRedirect/?accessToken=${accessToken}&SID=${SID}`;
    else
      window.open(
        `https://mirror.dsessential.com/Dsessential/panel/changeRole/iframeRedirect/?accessToken=${accessToken}&SID=${SID}`
      );
  });

  return (
    <>
      <div class={styles.container}>
        <div class={styles.switchUserSelection}>
          <SelectBox
            selectValue={selectValue}
            options={["SID", "姓名", "學生電話"]}
            placeholder="類型"
          />
          <AutoCompleteBox
            searchValue={searchValue}
            freeSolo={true}
            options={
              groupOptions[
                selectValue.value === "SID"
                  ? 0
                  : selectValue.value === "姓名"
                    ? 1
                    : 2
              ] as string[]
            }
            placeholder="請選擇學生"
          />
          <button class={styles.switchUserButton} onClick$={clickSwitchUser}>
            切換
          </button>
        </div>
        {iframeURL.value && (
          <iframe src={iframeURL.value} class={styles.iframe} />
        )}
      </div>
      {errorBox.value && <Prompt message="找不到學生" refresh={true} />}
    </>
  );
});
