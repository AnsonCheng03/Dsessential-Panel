import { component$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useGetAllUser = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;

  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/log-service/viewLog`,
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
  const options = useGetAllUser().value;
  return (
    <>
      <h1 class={styles.title}>系統紀錄</h1>

      <div class={styles.container}>
        <div class={styles.item}>
          <div>日期</div>
          <div>用戶名稱</div>
          <div>事件</div>
          <div>備註</div>
        </div>
        {options.map((option: any, index: number) => {
          return (
            <div key={index} class={styles.item}>
              <div>
                {new Date(option.Date).toLocaleString("en-US", {
                  timeZone: "Asia/Hong_Kong",
                })}
              </div>
              <div>{option.UserID}</div>
              <div>{option.Event}</div>
              <div>{option.Notes}</div>
            </div>
          );
        })}
      </div>
    </>
  );
});
