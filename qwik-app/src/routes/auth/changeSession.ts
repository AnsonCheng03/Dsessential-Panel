import { $ } from "@builder.io/qwik";

export const getCSRFToken = $(async () => {
  const res = fetch("/api/auth/csrf", {
    cache: "no-store",
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
      credentials: "include",
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
    const status = await (await res).status;
    const cookie = await (await res).headers.get("set-cookie");
    return { status, cookie };
  }
);

export const signOut = $(async (csrfToken: string) => {
  console.log(csrfToken);
  const res = fetch("/api/auth/signout", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
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
    document.cookie = `authjs.csrf-token=${csrfToken}; HttpOnly; Path=/; SameSite=None; Secure`;
    const response = await login(
      await getCSRFToken(),
      accessToken,
      role,
      loginName
    );

    if (response.status === 200 && response.cookie) {
      // set cookie
      document.cookie = response.cookie;
      window.location.href = "/Dsessential";
    } else {
      window.alert("發生錯誤");
    }
  }
);
