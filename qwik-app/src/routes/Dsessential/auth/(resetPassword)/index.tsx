import {
  type Signal,
  component$,
  useSignal,
  useVisibleTask$,
  useStore,
} from "@builder.io/qwik";
import { useNavigate, Form, Link } from "@builder.io/qwik-city";
import { useAuthSignin } from "~/routes/plugin@auth";

interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, adminRole, style, userName, password }: Props) => {
    const nav = useNavigate();
    const signIn = useAuthSignin();

    /* Todo: Add token to prevent brute force attack */

    if (adminRole.value) {
      useVisibleTask$(() => {
        // go back to sign in page after 5 seconds
        setTimeout(() => {
          formState.value = "signIn";
        }, 3000);
      });

      return (
        <div class={style.content}>
          <p>Admin password reset is not implemented yet.</p>
          <p>Please contact the developer. </p>
          <button onClick$={() => (formState.value = "signIn")}>Go Back</button>
        </div>
      );
    }

    return (
      <div class={style.content}>
        <h1 class={style.h1}>重置密碼</h1>
        <Form>
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
          <br />
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
          <br />

          <button
            type="button"
            onClick$={() => {
              formState.value = "signIn";
            }}
            class={style.button}
          >
            返回
          </button>
          {/* <button type="submit" name="resetpw" value="login">下一步</button> */}
        </Form>
      </div>
    );
  }
);
