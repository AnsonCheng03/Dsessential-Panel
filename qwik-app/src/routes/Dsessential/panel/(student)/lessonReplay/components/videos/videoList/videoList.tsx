import {
  type Signal,
  component$,
  $,
  useSignal,
  useServerData,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./videoList.module.css";
import { server$ } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import { CircularWithValueLabel } from "~/components/react/CircularWithValueLabel";
// import { hls } from "~/plugins/hls";
import Hls from "hls.js";

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
    const nonce = useServerData<string | undefined>("nonce");

    const session = useAuthSession();
    const accessToken = (session.value as any).accessToken;

    const loadingPercent = useSignal<string | null>(null);
    const currentLoopID = useSignal(0);

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
      return await fetch(fetchURL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url }),
      });
    });

    return (
      <>
        <script nonce={nonce}>
          {/* https://cdn.jsdelivr.net/npm/hls.js@latest */}
          {/* {hls} */}
        </script>
        <div class={[styles.videoPlayerContainer, styles.playerHidden]}>
          <video controls class={styles.videoPlayer} />
          {loadingPercent.value !== null && (
            <div class={styles.videoPlayerOverlay}>
              <div class={styles.loadingContainer}>
                <p>{`你係第一個開呢條片！準備緊～`}</p>
                <CircularWithValueLabel
                  value={Number(loadingPercent.value || 0)}
                  size={100}
                />
              </div>
            </div>
          )}
        </div>
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
                                  const videoElement =
                                    document.querySelector("video");
                                  videoElement?.parentElement?.classList.remove(
                                    styles.playerHidden
                                  );
                                  loadingPercent.value = null;

                                  const [fetchURL, rawVideo] =
                                    await fetchVideoLink(url);
                                  const video = await fetchVideo(
                                    fetchURL,
                                    rawVideo
                                  );

                                  let videoStatus = video.status;

                                  const loopID = new Date().getTime();
                                  currentLoopID.value = loopID;

                                  // fetch again until it status is 200
                                  while (
                                    videoStatus === 202 &&
                                    loopID === currentLoopID.value
                                  ) {
                                    try {
                                      const video = await fetchVideo(
                                        fetchURL,
                                        rawVideo
                                      );
                                      videoStatus = video.status;
                                      loadingPercent.value = (
                                        await video.json()
                                      ).percent;
                                    } catch (e) {
                                      console.log(e);
                                    }

                                    await new Promise((resolve) =>
                                      setTimeout(resolve, 1000)
                                    );
                                  }

                                  loadingPercent.value = null;

                                  if (videoElement) {
                                    if (Hls.isSupported()) {
                                      const hls = new Hls();
                                      hls.loadSource(
                                        URL.createObjectURL(await video.blob())
                                      );
                                      hls.attachMedia(videoElement);
                                      hls.on(
                                        Hls.Events.MANIFEST_PARSED,
                                        function () {
                                          console.log("MANIFEST_PARSED");
                                          videoElement.play();
                                        }
                                      );
                                    } else if (
                                      videoElement.canPlayType(
                                        "application/vnd.apple.mpegurl"
                                      )
                                    ) {
                                      videoElement.src = URL.createObjectURL(
                                        await video.blob()
                                      );
                                      videoElement.addEventListener(
                                        "loadedmetadata",
                                        function () {
                                          console.log("loadedmetadata");
                                          videoElement.play();
                                        }
                                      );
                                    } else {
                                      alert("Your browser is not supported");
                                    }

                                    videoElement.classList.remove(
                                      styles.playerHidden
                                    );
                                    videoElement.scrollIntoView({
                                      behavior: "smooth",
                                    });
                                  }
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
