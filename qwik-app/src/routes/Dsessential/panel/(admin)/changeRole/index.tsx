import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { AutoCompleteBox } from "~/components/autoComplete/reactSearchBar";
import { SelectBox } from "./reactSelectBox";
import { routeLoader$ } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import Prompt from "~/components/prompt/prompt";

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

  const getCSRFToken = $(async () => {
    const res = fetch("/api/auth/csrf", {
      cache: "no-store",
    });
    const { csrfToken } = await (await res).json();
    return csrfToken;
  });

  const login = $(async (csrfToken: string, loginName: string) => {
    const res = fetch("/api/auth/callback/credentials", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "changeRole",
        username: loginName,
        password: accessToken,
        csrfToken,
      }),
    });
    return await (
      await res
    ).status;
  });

  const signOut = $(async (csrfToken: string) => {
    const res = fetch("/api/auth/signout", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        csrfToken,
      }),
    });
    return await (
      await res
    ).status;
  });

  const clickSwitchUser = $(async () => {
    const getSID = (key: string, value: string) =>
      options.find((item: any) => item[key] === value)?.SID;
    const SID = getSID(selectValue.value, searchValue.value);
    if (!SID) {
      errorBox.value = true;
      return;
    }

    await signOut(await getCSRFToken());
    await login(await getCSRFToken(), SID);
    window.location.href = "/Dsessential";
  });

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
      {errorBox.value && <Prompt message="找不到學生" />}
    </>
  );
});
