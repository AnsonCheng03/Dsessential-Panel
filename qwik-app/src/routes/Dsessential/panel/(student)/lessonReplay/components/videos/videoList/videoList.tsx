import { type Signal, component$ } from "@builder.io/qwik";
import styles from "./videoList.module.css";

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
    return (
      <>
        {Object.entries(videoList).map((videoType: any) => {
          if (searchValue.value !== "" || videoType[0] === selectedType.value)
            return Object.entries(videoType[1]).map((episode: any) => {
              if (!selectedMonth.value || episode[0] === selectedMonth.value)
                return Object.entries(episode[1]).map((video: any) => {
                  console.log(
                    "np",
                    video[1].video,
                    video[1].notes,
                    searchValue.value
                  );
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
                              <button key={url} class={styles.videoButton}>
                                {fileName}
                              </button>
                            );
                          })}
                          {video[1].notes.map((url: string) => {
                            const fileName = url
                              .split("/")
                              .pop()
                              ?.split(".")[0];
                            return (
                              <button key={url} class={styles.videoButton}>
                                {fileName}
                              </button>
                            );
                          })}
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
