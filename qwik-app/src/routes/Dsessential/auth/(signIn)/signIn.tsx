import { type Signal, component$, $ } from "@builder.io/qwik";
import { Form, useLocation, useNavigate } from "@builder.io/qwik-city";
import Prompt from "~/components/prompt/prompt";
import { useAuthSignin } from "~/routes/plugin@auth";

interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(({ adminRole, style, userName }: Props) => {
  const signIn = useAuthSignin();
  const nav = useNavigate();
  const location = useLocation();
  const errorMessage = location.url.searchParams.get("error") || "";

  const onErrorClose = $(() => {
    window.history.replaceState(null, "", window.location.pathname);
  });

  return (
    <div class={style.content}>
      <h1 class={style.h1}>尚研閱文憑試支援中心</h1>
      {errorMessage &&
        (errorMessage === "CredentialsSignin" ? (
          <Prompt
            message="登入失敗\n請檢查帳號密碼是否正確。"
            onClose={onErrorClose}
          />
        ) : (
          <Prompt
            message={`伺服器錯誤\n請稍後再試。\n(錯誤代碼: ${errorMessage})`}
            onClose={onErrorClose}
          />
        ))}
      <Form action={signIn}>
        <input
          type="hidden"
          class={style.inputProvider}
          name="providerId"
          value="credentials"
        />
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
          placeholder={adminRole.value ? "職員名稱" : "卡號/電話號碼/中文姓名"}
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
        <div class={style.loginBoxContainer}>
          <button class={style.button}>登入</button>
          {adminRole.value && (
            <div
              class={style.googleSignInButton}
              control-id="ControlID-1"
              onClick$={async () =>
                signIn.submit({
                  providerId: "google",
                  options: {
                    callbackUrl: "/Dsessential/panel",
                  },
                })
              }
            >
              <img
                loading="lazy"
                height="24"
                width="24"
                src="https://authjs.dev/img/providers/google.svg"
              />
              <span>Sign in with Google</span>
            </div>
          )}
        </div>
        <div
          class={style.resetPasswordContainer}
          onClick$={() => {
            // formState.value = "resetPassword";
            nav("/oldserver/Dsessential/auth/resetpw.php");
          }}
        >
          <div class={style.resetPassword}>
            按此重設密碼<p class={style.bold}>首次登入請點擊這裡</p>
          </div>
        </div>
      </Form>
    </div>
  );
});
