import { $ } from "@builder.io/qwik";

export const getCSRFToken = $(async () => {
  const res = fetch("/api/auth/csrf", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const { csrfToken } = await (await res).json();
  return csrfToken;
});

export const login = $(
  async (
    csrfToken: string,
    accessToken: string,
    method: string,
    loginName: string
  ) => {
    const res = fetch("/api/auth/callback/credentials", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        role: method,
        username: loginName,
        password: accessToken,
        csrfToken,
      }).toString(),
    });
    return await (
      await res
    ).status;
  }
);

export const signOut = $(async (csrfToken: string) => {
  console.log(csrfToken);
  const res = fetch("/api/auth/signout", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken,
    }).toString(),
  });
  return await (
    await res
  ).status;
});

export const changeSession = $(
  async (accessToken: string, role: string, loginName: string) => {
    let csrfToken = await getCSRFToken();
    await signOut(csrfToken);

    csrfToken = await getCSRFToken();
    const response = await login(
      await getCSRFToken(),
      accessToken,
      role,
      loginName
    );

    if (response === 200) {
      window.location.href = "/Dsessential";
    } else {
      window.alert("發生錯誤");
    }
  }
);
