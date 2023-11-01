import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import UsefulLinks from "./components/usefulLinks/usefulLinks";
import Videos from "./components/videos/videos";
import styles from "./index.module.css";

export const useGetVideoList = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/lesson-replay/videoList`,
      {
        cache: "no-store",
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return await res.json();
  } catch (error) {
    console.log(error);
  }
});

export default component$(() => {
  const videoList = useGetVideoList().value;

  return (
    <>
      {videoList && !["New", "Not Found", "Expired"]?.includes(videoList[0]) ? (
        <>
          <Videos videoList={videoList} />
        </>
      ) : (
        <div class={styles.errorBox}>
          {videoList &&
            (videoList[0] === "New" ? (
              <p>請先上第一堂再觀看影片！</p>
            ) : videoList[0] === "Expired" ? (
              <p>請繳交學費！</p>
            ) : (
              <p>
                找不到學生 <br /> 請聯絡管理員！
              </p>
            ))}
        </div>
      )}
      <UsefulLinks />
    </>
  );
});
