import { type Signal, component$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  resetState: Signal<
    "default" | "securityCheck" | "resetPassword" | "updatePassword"
  >;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, resetState, adminRole, style, userName }: Props) => {
    return (
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
          placeholder={adminRole.value ? "職員名稱" : "卡號/電話號碼/中文姓名"}
          name="options.username"
          type="text"
          autoComplete="username"
          bind:value={userName}
        />
        <br />
        <button
          class={style.button}
          onClick$={() => {
            formState.value = "signIn";
          }}
        >
          返回
        </button>

        <button
          class={style.button}
          name="resetpw"
          onClick$={() => {
            resetState.value = "securityCheck";
          }}
        >
          下一步
        </button>
      </Form>
    );
  }
);
