import { component$, useSignal } from "@builder.io/qwik";
import { Form, type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import {
  useAuthSession,
  useAuthSignin,
  useAuthSignout,
} from "~/routes/plugin@auth";
import style from "./index.module.css";

export default component$(() => {
  const signIn = useAuthSignin();
  const signOut = useAuthSignout();
  const session = useAuthSession();
  const nav = useNavigate();
  const adminRole = useSignal(false);

  return (
    <div class={style.center}>
      <div class={style.content}>
        <h1 class={style.h1}>
          尚研閱文憑試支援中心
          <br />
          登入分區
        </h1>
        <Form>
          <div class={style.switchToggle}>
            <input
              class={style.input}
              id="student"
              name="role"
              type="radio"
              value="student"
              checked={!adminRole.value}
              onClick$={() => {
                adminRole.value = false;
              }}
            />
            <label class={style.label} for="student">
              學生
            </label>
            <input
              class={style.input}
              id="admin"
              name="role"
              type="radio"
              value="admin"
              bind:checked={adminRole}
            />
            <label class={style.label} for="admin">
              管理員
            </label>
          </div>
          <input
            class={[style.input, style.loginInput]}
            placeholder={
              adminRole.value ? "職員名稱" : "卡號/電話號碼/中文姓名"
            }
            id="ID"
            name="ID"
            type="text"
            autoComplete={"username"}
          />
          <input
            class={[style.input, style.loginInput]}
            placeholder="密碼"
            name="password"
            type="password"
            autoComplete={"current-password"}
          />
          <br />
          <button
            class={style.button}
            type="submit"
            name="requestmode"
            value="login"
          >
            登入
          </button>
          <div
            class={style.resetPasswordContainer}
            onClick$={() => {
              nav("auth/resetpw");
            }}
          >
            <div class={style.resetPassword}>
              按此重設密碼<a class={style.bold}>首次登入請留空密碼</a>
            </div>
          </div>
        </Form>
      </div>
    </div>
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
