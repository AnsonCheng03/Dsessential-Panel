import { component$ } from "@builder.io/qwik";
import UsefulLinks from "./components/usefulLinks/usefulLinks";
import Videos from "./components/videos/videos";

export default component$(() => {
  return (
    <>
      <Videos />
      <UsefulLinks />
    </>
  );
});
