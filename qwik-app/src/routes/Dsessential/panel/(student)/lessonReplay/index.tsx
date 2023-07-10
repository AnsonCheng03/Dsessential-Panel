import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import UsefulLinks from "./components/usefulLinks/usefulLinks";
import Videos from "./components/videos/videos";

export const getVideoList = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `http://${requestEvent.url.hostname}:3500/lesson-replay/videoList`,
      {
        cache: "no-store",
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    if (!data.statusCode) return data;
  } catch (error) {
    console.log(error);
  }
});

export default component$(() => {
  const videoList = getVideoList().value;
  console.log(videoList);

  return (
    <>
      <Videos />
      <UsefulLinks />
    </>
  );
});
