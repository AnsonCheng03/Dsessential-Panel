import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import styles from "./index.module.css";
import logo from "~/components/logo/logo.png";

export const useGetUserData = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/profile`,
      {
        cache: "no-store",
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
  const userData = useGetUserData().value;

  return (
    <>
      <div class={styles.profileBox}>
        <img alt={"logo"} src={logo}></img>
        <br />
        學生編號：{userData?.username} <br />
        角色： {userData?.role === "student" ? "學生" : "管理員"}
      </div>

      {userData.role === "student" ? null : (
        <div class={styles.linkBox}>
          <span>
            <p>校務管理</p>
            <a href="https://dsessentialbooking.secure.simplybook.asia/v2/welcome">
              租務管理系統 2.0
            </a>
            <a href="https://campsite.bio/tutorial">課程及租務資料</a>
          </span>
          <span>
            <p>市場推廣</p>
            <a href="https://apphi.com/#/">Apphi（IG廣告用）</a>
            <a href="https://www.canva.com/">Canva（設計用）</a>
            <help>
              Apphi: 自動貼廣告。賬號：alanlau715@gmail.com，密碼：Solodse_1517
              <br />
              Canva: 設計海報、IG貼圖用的程式。完全免費，可自行Signup使用。
            </help>
          </span>
          <span>
            <p>學生資料</p>
            <a href="https://docs.google.com/spreadsheets/d/11pFx0c2MjCMZYq6O2VTN4g9vUijw7mtCbXqiOvfctJ8/edit#gid=1892215944">
              學生資料篩選器
            </a>
            <a href="https://docs.google.com/spreadsheets/d/1dBCGDIgnBKqVR6WCyIrESQqQzcqhIse0KFOLhCJrHDM/edit?ouid=110423679567130319195&usp=sheets_home">
              學生資料總表
            </a>
            <a href="https://docs.google.com/spreadsheets/d/1V5SY55VS3JIfFkhHHKBWWQbO_aqU9Jc6FDWUq7b6xOg/edit#gid=34308639">
              學生報到機
            </a>
          </span>
        </div>
      )}
    </>
  );
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
