import { component$, useSignal } from "@builder.io/qwik";
import Search from "./search/search";
import VideoList from "./videoList/videoList";

export default component$(({ videoList }: any) => {
  const getStringsFromDeepestVideo = (obj: Object) => {
    const strings: any = [];

    function exploreObject(obj: Object) {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          if (typeof item === "string") {
            // get the file name (without extension) from the url string
            const fileName = item.split("/").pop()?.split(".")[0];
            strings.push(fileName);
          }
        });
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach((value) => {
          exploreObject(value);
        });
      }
    }

    exploreObject(obj);
    return strings;
  };

  const availableMonth = Object.entries(videoList).map(([key, value]) => [
    key,
    Object.keys(value as Object),
  ]);
  const availableVideos = getStringsFromDeepestVideo(videoList);
  const selectedType = useSignal(availableMonth[0][0] as string);
  const selectedMonth = useSignal<string | null>(null);
  const searchValue = useSignal("");

  return (
    <>
      <Search
        availableVideos={availableVideos}
        availableMonth={availableMonth}
        selectedType={selectedType}
        selectedMonth={selectedMonth}
        searchValue={searchValue}
      />
      <VideoList
        videoList={videoList}
        selectedType={selectedType}
        selectedMonth={selectedMonth}
        searchValue={searchValue}
      />
    </>
  );
});
