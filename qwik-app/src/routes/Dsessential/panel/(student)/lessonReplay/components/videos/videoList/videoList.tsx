import { type Signal, component$, $ } from "@builder.io/qwik";
import styles from "./videoList.module.css";
import { server$ } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";

export default component$(
  ({
    videoList,
    selectedType,
    selectedMonth,
    searchValue,
  }: {
    videoList: any;
    selectedType: Signal<string>;
    selectedMonth: Signal<string | null>;
    searchValue: Signal<string>;
  }) => {
    const session = useAuthSession();
    const accessToken = (session.value as any).accessToken;

    const fetchVideoLink = server$(async function (url: string) {
      const rawVideo = await fetch(
        `${process.env.BACKEND_ADDRESS}:3500/video/createStream`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${
              this.sharedMap.get("session").accessToken
            }`,
          },
          body: JSON.stringify({ url }),
        }
      );
      return [
        `${process.env.BACKEND_ADDRESS}:3500/video/stream`,
        await rawVideo.text(),
      ];
    });

    const fetchVideo = $(async function (fetchURL: string, url: string) {
      const rawVideo = await fetch(fetchURL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url }),
      });
      // return await rawVideo.blob();
      const video = document.querySelector("video");
      if (video) {
        video.src = URL.createObjectURL(await rawVideo.blob());
        video.load();
        video.classList.remove(styles.playerHidden);
        video.scrollIntoView({ behavior: "smooth" });
      }
    });

    return (
      <>
        <video controls class={[styles.videoPlayer, styles.playerHidden]} />
        {Object.entries(videoList).map((videoType: any) => {
          if (searchValue.value !== "" || videoType[0] === selectedType.value)
            return Object.entries(videoType[1]).map((episode: any) => {
              if (!selectedMonth.value || episode[0] === selectedMonth.value)
                return Object.entries(episode[1]).map((video: any) => {
                  return (
                    (searchValue.value === "" ||
                      [...video[1].video, ...video[1].notes].find((item) =>
                        item.includes(searchValue.value)
                      )) && (
                      <div
                        key={`${episode[0]}-${video[0]}`}
                        class={styles.episodeContainer}
                      >
                        <p
                          class={styles.episodeTitle}
                        >{`${episode[0]} - ${video[0]}`}</p>
                        <div class={styles.buttonContainer}>
                          {video[1].video.map((url: string) => {
                            const fileName = url
                              .split("/")
                              .pop()
                              ?.split(".")[0];
                            return (
                              <button
                                key={url}
                                class={styles.videoButton}
                                onClick$={async () => {
                                  const [fetchURL, rawVideo] =
                                    await fetchVideoLink(url);
                                  fetchVideo(fetchURL, rawVideo);
                                }}
                              >
                                {fileName}
                              </button>
                            );
                          })}
                          {/* 
                          TODO: Add notes
                          {video[1].notes.map((url: string) => {
                            const fileName = url
                              .split("/")
                              .pop()
                              ?.split(".")[0];
                            return (
                              <button
                                key={url}
                                class={styles.videoButton}
                                onClick$={async () => {
                                  const rawVideo = await fetchVideoLink(url);
                                  console.log(typeof rawVideo);
                                }}
                              >
                                {fileName}
                              </button>
                            );
                          })} */}
                        </div>
                      </div>
                    )
                  );
                });
            });
        })}
      </>
    );
  }
);
