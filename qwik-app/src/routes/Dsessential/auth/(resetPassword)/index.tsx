import { type Signal, component$, useSignal } from "@builder.io/qwik";
import LocateUser from "./(locateUser)";
import ResetPassword from "./(resetPassword)";
import UpdatePassword from "./(updatePassword)";
import SecurityCheck from "./(securityCheck)";

interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, adminRole, style, userName }: Props) => {
    /* Todo: Add token to prevent brute force attack */
    const resetState = useSignal<
      "default" | "securityCheck" | "resetPassword" | "updatePassword"
    >("default");

    if (adminRole.value) {
      return (
        <div class={style.content}>
          <p>Admin password reset is not implemented yet.</p>
          <p>Please contact the developer. </p>
          <button
            class={style.button}
            onClick$={() => (formState.value = "signIn")}
          >
            Go Back
          </button>
        </div>
      );
    }

    return (
      <div class={style.content}>
        <h1 class={style.h1}>重置密碼</h1>
        {(resetState.value === "updatePassword" && (
          <UpdatePassword
            formState={formState}
            resetState={resetState}
            style={style}
            userName={userName}
            adminRole={adminRole}
          />
        )) ||
          (resetState.value === "resetPassword" && (
            <ResetPassword
              formState={formState}
              resetState={resetState}
              style={style}
              userName={userName}
              adminRole={adminRole}
            />
          )) ||
          (resetState.value === "securityCheck" && (
            <SecurityCheck
              formState={formState}
              resetState={resetState}
              style={style}
              userName={userName}
              adminRole={adminRole}
            />
          )) || (
            <LocateUser
              formState={formState}
              resetState={resetState}
              style={style}
              userName={userName}
              adminRole={adminRole}
            />
          )}
      </div>
    );
  }
);
