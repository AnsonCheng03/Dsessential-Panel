import { $, component$, useSignal, useStore } from "@builder.io/qwik";
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
  const displayOptions = useStore(options);
  const currentSortOption = useSignal("Date");

  const sortOption = $((option: string) => {
    if (option === currentSortOption.value) {
      displayOptions.reverse();
      return;
    }

    switch (option) {
      case "Date":
        currentSortOption.value = "Date";
        displayOptions.sort((a: any, b: any) => {
          return new Date(b.Date).getTime() - new Date(a.Date).getTime();
        });
        break;
      case "UserID":
        currentSortOption.value = "UserID";
        displayOptions.sort((a: any, b: any) => {
          return a.UserID.localeCompare(b.UserID);
        });
        break;
      case "Event":
        currentSortOption.value = "Event";
        displayOptions.sort((a: any, b: any) => {
          return a.Event.localeCompare(b.Event);
        });
        break;
      case "Notes":
        currentSortOption.value = "Notes";
        displayOptions.sort((a: any, b: any) => {
          return a.Notes.localeCompare(b.Notes);
        });
        break;
      default:
        break;
    }
    console.log(displayOptions);
  });

  return (
    <>
      <h1 class={styles.title}>系統紀錄</h1>

      <div class={styles.container}>
        <div class={styles.item}>
          <div
            onClick$={() => {
              sortOption("Date");
            }}
          >
            日期
            {currentSortOption.value === "Date" && (
              <span class={styles.arrow}> •</span>
            )}
          </div>
          <div
            onClick$={() => {
              sortOption("UserID");
            }}
          >
            用戶名稱
            {currentSortOption.value === "UserID" && (
              <span class={styles.arrow}> •</span>
            )}
          </div>
          <div
            onClick$={() => {
              sortOption("Event");
            }}
          >
            事件
            {currentSortOption.value === "Event" && (
              <span class={styles.arrow}> •</span>
            )}
          </div>
          <div
            onClick$={() => {
              sortOption("Notes");
            }}
          >
            備註
            {currentSortOption.value === "Notes" && (
              <span class={styles.arrow}> •</span>
            )}
          </div>
        </div>
        {displayOptions.map((option: any, index: number) => {
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
