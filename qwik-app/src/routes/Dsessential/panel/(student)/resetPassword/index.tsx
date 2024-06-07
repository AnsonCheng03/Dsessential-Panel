import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { server$ } from "@builder.io/qwik-city";

export default component$(() => {
  const password = useSignal("");
  const confirmPassword = useSignal("");

  const serverSideSubmitResetPassword = server$(async function (
    password: string
  ) {
    const res = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${this.sharedMap.get("session").accessToken}`,
        },
        body: JSON.stringify({
          username: this.sharedMap.get("session").user.id,
          password,
        }),
      }
    );
    return await res.json();
  });

  const submitResetPassword = $(async (event: Event) => {
    event.preventDefault();
    if (password.value !== confirmPassword.value) {
      alert("密碼不一致");
      return;
    }
    const res = await serverSideSubmitResetPassword(password.value);
    if (res.statusCode) {
      alert(res.message);
      return;
    }
    alert("密碼重設成功");
    location.href = "/Dsessential";
  });

  return (
    <>
      <div class={styles.container}>
        <form
          class={styles.content}
          window:onSubmit$={submitResetPassword}
          preventdefault:submit
        >
          <h1 class={styles.title}>重設密碼</h1>
          <input
            class={[styles.input, styles.loginInput]}
            placeholder="新密碼"
            name="options.username"
            type="text"
            bind:value={password}
          />
          <input
            class={[styles.input, styles.loginInput]}
            placeholder="確認新密碼"
            name="options.username"
            type="text"
            bind:value={confirmPassword}
          />
          <button class={styles.button}>確認</button>
        </form>
      </div>
    </>
  );
});
