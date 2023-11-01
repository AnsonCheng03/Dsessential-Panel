import { component$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useGetAllUser = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;

  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/login-log`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
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
  const options = useGetAllUser().value;
  return (
    <>
      <h1 class={styles.title}>登入紀錄</h1>

      <div class={styles.container}>
        <div class={styles.item}>
          <div>日期</div>
          <div>用戶名稱</div>
        </div>
        {options.map((option: any, index: number) => {
          return (
            <div key={index} class={styles.item}>
              <div>{option.Time}</div>
              <div>{option.Account}</div>
            </div>
          );
        })}
      </div>
    </>
  );
});
