import { component$ } from "@builder.io/qwik";
import {
  Link,
  type DocumentHead,
  type RequestHandler,
} from "@builder.io/qwik-city";
import style from "./index.module.css";

export default component$(() => {
  return <div class={style.center}></div>;
});

export const head: DocumentHead = {
  title: "尚研閱文憑試支援中心",
  meta: [
    {
      name: "description",
      content: "尚研閱文憑試支援中心",
    },
  ],
};
