import { type Signal, component$, useVisibleTask$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, adminRole, style, userName }: Props) => {
    /* Todo: Add token to prevent brute force attack */

    useVisibleTask$(() => {
      if (adminRole.value)
        setTimeout(() => {
          formState.value = "signIn";
        }, 3000);
    });

    if (adminRole.value) {
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
            onClick$={() => {
              formState.value = "signIn";
            }}
            class={style.button}
          >
            返回
          </button>

          <button class={style.button}>下一步</button>
        </Form>
      </div>
    );
  }
);
