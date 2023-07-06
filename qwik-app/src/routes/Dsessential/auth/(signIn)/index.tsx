import { type Signal, component$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import { useAuthSignin } from "~/routes/plugin@auth";

interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, adminRole, style, userName }: Props) => {
    const signIn = useAuthSignin();

    return (
      <div class={style.content}>
        <h1 class={style.h1}>尚研閱文憑試支援中心</h1>
        <Form action={signIn}>
          <input type="hidden" name="providerId" value="credentials" />
          <div class={style.switchToggle}>
            <input
              class={style.input}
              id="student"
              name="options.role"
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
              name="options.role"
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
            name="options.username"
            type="text"
            autoComplete="username"
            bind:value={userName}
          />
          <input
            class={[style.input, style.loginInput]}
            placeholder="密碼"
            name="options.password"
            type="password"
            autoComplete="current-password"
          />
          <br />
          <button class={style.button}>登入</button>
          <div
            class={style.resetPasswordContainer}
            onClick$={() => {
              formState.value = "resetPassword";
            }}
          >
            <div class={style.resetPassword}>
              按此重設密碼<a class={style.bold}>首次登入請留空密碼</a>
            </div>
          </div>
        </Form>
      </div>
    );
  },
);
