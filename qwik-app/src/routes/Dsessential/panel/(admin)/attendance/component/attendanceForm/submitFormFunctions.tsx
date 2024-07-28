import { globalAction$ } from "@builder.io/qwik-city";

export const useFormSubmit = globalAction$(async (input, requestEvent) => {
  const output: Record<string, any> = {};

  for (const key in input) {
    const [prefix, suffix] = key.split("_");

    if (output[prefix]) {
      if (Array.isArray(output[prefix])) {
        output[prefix].push(input[key]);
      } else {
        output[prefix] = [output[prefix] as string, input[key]];
      }
    } else {
      if (suffix === undefined) {
        output[prefix] = input[key];
      } else {
        output[prefix] = [input[key]];
      }
    }
  }

  output["ipAddress"] = requestEvent.clientConn.ip;

  try {
    const res = await fetch(
      `${process.env.INTERNAL_BACKEND}/attendance/sendForm`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${
            requestEvent.sharedMap.get("session").accessToken
          }`,
        },
        body: JSON.stringify(output),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return { error: "error" };
  }
});

export const useFormDelete = globalAction$(async (input, requestEvent) => {
  try {
    const res = await fetch(
      `${process.env.INTERNAL_BACKEND}/attendance/deleteForm`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${
            requestEvent.sharedMap.get("session").accessToken
          }`,
        },
        body: JSON.stringify({
          deleteRow: input.deleteRow,
          ipAddress: requestEvent.clientConn.ip,
        }),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    return "error";
  }
});
