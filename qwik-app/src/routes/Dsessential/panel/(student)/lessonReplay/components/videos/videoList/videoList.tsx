import { type Signal, component$, $, useSignal } from "@builder.io/qwik";
import styles from "./videoList.module.css";
import { server$ } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import { CircularWithValueLabel } from "~/components/react/CircularWithValueLabel";
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
    const session = useAuthSession();
    const accessToken = (session.value as any).accessToken;

    const loadingPercent = useSignal<string | null>(null);
    const currentVideoID = useSignal("0");

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
        `${process.env.BACKEND_ADDRESS}:3500/video`,
        await rawVideo.text(),
      ];
    });

    const fetchVideoKey = $(async function (
      fetchURL: string,
      videoKey: string
    ) {
      const keyObject = await fetch(`${fetchURL}/getKey/${videoKey}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      });
      if (keyObject.status !== 200) throw new Error("Key not found");
      const key = await keyObject.blob();
      return key;
    });

    const fetchVideo = $(async function (
      fetchURL: string,
      videoKey: string,
      keyBlobURL: string
    ) {
      return await fetch(`${fetchURL}/stream/${videoKey}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ keyBlobURL: btoa(keyBlobURL) }),
      });
    });

    const videoButtonClickHandler = $(async (url: string) => {
      // Init value
      const videoElement = document.querySelector("video");
      videoElement?.parentElement?.classList.remove(styles.playerHidden);
      loadingPercent.value = null;

      const [backendURL, videoID] = await fetchVideoLink(url);
      currentVideoID.value = videoID;

      // get key
      let video;
      let keyURL;

      try {
        const key = await fetchVideoKey(backendURL, currentVideoID.value);
        console.log(key);
        keyURL = URL.createObjectURL(key);
        video = await fetchVideo(backendURL, currentVideoID.value, keyURL);
      } catch (e) {
        video = await fetchVideo(backendURL, currentVideoID.value, "");
        const key = await fetchVideoKey(backendURL, currentVideoID.value);
        keyURL = URL.createObjectURL(key);
      }

      let videoStatus = video.status;
      const loopID = currentVideoID.value;

      // fetch again until it status is 200
      while (videoStatus !== 200 && loopID === currentVideoID.value) {
        try {
          const video = await fetchVideo(
            backendURL,
            currentVideoID.value,
            keyURL
          );
          videoStatus = video.status;
          loadingPercent.value = (await video.json()).percent;
        } catch (e) {
          console.log(e);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      loadingPercent.value = null;

      if (videoElement) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(URL.createObjectURL(await video.blob()));

          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
          });
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          // add video source
          videoElement.src = `${backendURL}/streamList/${
            currentVideoID.value
          }?key=${btoa(keyURL)}`;

          videoElement.addEventListener("loadedmetadata", function () {
            videoElement.play();
          });
        } else {
          alert("Your browser is not supported");
        }

        videoElement.classList.remove(styles.playerHidden);
        videoElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });

    return (
      <>
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
                                  videoButtonClickHandler(url);
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
