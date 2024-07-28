import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { ChatGPTAPI } from "chatgpt";
import { useAuthSession } from "~/routes/plugin@auth";
import { type RequestHandler, server$ } from "@builder.io/qwik-city";
import type { Session } from "@auth/core/types";

const gptAPI = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY!,
  completionParams: {
    // model: "gpt-3.5-turbo-16k",
    model: "gpt-4",
  },
});

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");
  if ((session?.user as any)?.role === "student")
    throw event.redirect(302, `/Dsessential/panel`);
};

function createProgressEmitter() {
  let res: any;
  const queue: any = [];

  async function* internalGenerator() {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift();
      } else {
        await new Promise((resolve) => {
          res = resolve;
        });
      }
    }
  }

  return {
    generator: internalGenerator(),
    push: (value: any) => {
      queue.push(value);
      if (res) {
        res();
        res = null;
      }
    },
  };
}

const queryGPT = server$(async function* (
  query: string,
  parentID: string | null
) {
  const { generator: progressGenerator, push: pushProgress } =
    createProgressEmitter();
  // Start the API call
  gptAPI
    .sendMessage(query, {
      ...(parentID ? { parentMessageId: parentID } : {}),
      onProgress: (progress) => {
        pushProgress([progress.text, progress.id]);
      },
    })
    .then((res) => {
      // Once done, push the result to the generator
      pushProgress([res.text, res.id, res.detail?.choices[0].finish_reason]);
    });

  for await (const update of progressGenerator) {
    yield update;
  }
});

const backendAddress = server$(async function () {
  return `${process.env.EXTERNAL_BACKEND}`;
});

const downloadAsWord = $(async function (
  conversation: {
    type: string;
    content: string;
    id?: string;
  }[],
  accessToken: string
) {
  if (conversation.length === 0) return;

  // only get responses from the bot
  const botResponses = conversation.filter((item) => item.type === "bot");
  const botResponsesText = botResponses.map((item) => item.content).join("\n");

  const wordToDownload = await fetch(
    `${await backendAddress()}/gpt-generator/downloadRecord`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        text: botResponsesText,
      }),
    }
  );

  // download the word file
  const blob = await wordToDownload.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gpt.docx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
});

const getQueryOptions = server$(async function (
  action?: "append" | "appendPublic" | "remove" | "removePublic",
  value?: string
) {
  const queryOptions = await fetch(
    `${await backendAddress()}/gpt-generator/queryOptions`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.sharedMap.get("session").accessToken}`,
      },
      body: JSON.stringify({
        action,
        value,
      }),
    }
  );
  const res = await queryOptions.json();
  const options = [res.questions, res.privateQuestions];
  return options;
});

export default component$(() => {
  const session = useAuthSession();
  const accessToken = (session.value as any).accessToken;
  const queryValue = useSignal("");
  const waitingResponse = useSignal(false);
  const queryOptionsPublic = useSignal<string[]>([""]);
  const queryOptionsPrivate = useSignal<string[]>([""]);
  const hideOptions = useSignal(false);
  const conversation = useSignal<
    {
      type: string;
      content: string;
      id?: string;
    }[]
  >([]);
  const parentID = useSignal<string | null>(null);

  const requestGPT = $(async (requestValue: string, continueID?: string) => {
    const res = await queryGPT(requestValue, parentID.value);
    let previousChatContent = "";
    for await (const i of res) {
      parentID.value = i[1];

      // Check if the id already exists
      const existingIndex = conversation.value.findIndex(
        (item) => item.id === (continueID ? continueID : i[1])
      );

      if (continueID) {
        conversation.value[existingIndex].id = i[1];
        previousChatContent = conversation.value[existingIndex].content;
        continueID = undefined;
      }

      if (existingIndex !== -1) {
        // ID exists, replace content
        conversation.value[existingIndex].content = previousChatContent + i[0];
        // refresh the array
        conversation.value = [...conversation.value];
        hideOptions.value = true;
      } else {
        // ID doesn't exist, add a new entry
        conversation.value = [
          ...conversation.value,
          { type: "bot", content: previousChatContent + i[0], id: i[1] },
        ];
      }
      if (i[2]) {
        if (i[2] === "length") return ["length", i[1]];
        break;
      }
    }
    queryValue.value = "";
    return ["done"];
  });

  const submitQuery = $(async () => {
    if (queryValue.value === "") return;
    conversation.value = [
      ...conversation.value,
      { type: "user", content: queryValue.value },
    ];
    waitingResponse.value = true;
    let currentQuery = queryValue.value;
    let status = [""];
    do {
      status = await requestGPT(currentQuery, status[1]);
      if (status[0] === "length") {
        currentQuery = "continue";
      }
    } while (status[0] !== "done");
    waitingResponse.value = false;
  });

  useTask$(async () => {
    [queryOptionsPublic.value, queryOptionsPrivate.value] =
      await getQueryOptions();
  });

  return (
    <>
      <h1 class={styles.title}>生成問題</h1>
      <form class={styles.queryBar} preventdefault:submit>
        <textarea
          class={styles.textarea}
          bind:value={queryValue}
          placeholder="請輸入問題"
          disabled={waitingResponse.value}
        ></textarea>
        <div class={styles.optionsButton}>
          <button
            class={styles.button}
            onClick$={async () => {
              const queryElement = document.querySelector(
                `.${styles.queryBar} textarea`
              ) as HTMLInputElement;
              const value = queryValue.value;
              if (!value) return;
              if (
                session?.value?.user?.email?.startsWith("admin@") &&
                confirm(`確定要把「${value}」新增至公開收藏嗎？`)
              ) {
                queryOptionsPublic.value = (
                  await getQueryOptions("appendPublic", value)
                )[0];
              } else if (confirm(`確定要把「${value}」新增至私人收藏嗎？`)) {
                queryOptionsPrivate.value = (
                  await getQueryOptions("append", value)
                )[1];
              }
              queryElement.focus();
            }}
            disabled={waitingResponse.value}
          >
            收藏此問題
          </button>

          <button
            class={styles.button}
            onClick$={() => {
              hideOptions.value = !hideOptions.value;
            }}
            disabled={waitingResponse.value}
          >
            顯示收藏
          </button>
          <button
            class={styles.button}
            onClick$={() => {
              downloadAsWord(conversation.value, accessToken);
            }}
            disabled={waitingResponse.value}
          >
            下載
          </button>
          <button
            class={styles.button}
            onClick$={submitQuery}
            disabled={waitingResponse.value}
          >
            生成
          </button>
        </div>
      </form>
      {!hideOptions.value &&
        (queryOptionsPublic.value || queryOptionsPrivate.value) && (
          <div class={styles.options}>
            <h3>收藏庫</h3>
            <div class={styles.optionContainer}>
              {queryOptionsPublic.value &&
                queryOptionsPublic.value.map((item) => {
                  return (
                    <div class={styles.option} key={item}>
                      <p class={styles.question} key={item}>
                        {item}
                      </p>
                      {session?.value?.user?.email?.startsWith("admin@") && (
                        <button
                          class={styles.delete}
                          onClick$={async () => {
                            if (
                              !confirm(
                                `確定要刪除「${item}」嗎？\n刪除後將無法復原！`
                              )
                            )
                              return;
                            queryOptionsPublic.value = (
                              await getQueryOptions("removePublic", item)
                            )[0];
                          }}
                        >
                          刪除
                        </button>
                      )}
                      <button
                        class={styles.delete}
                        key={item}
                        onClick$={() => {
                          queryValue.value = item;
                        }}
                      >
                        使用
                      </button>
                    </div>
                  );
                })}
              {queryOptionsPrivate.value &&
                queryOptionsPrivate.value.map((item) => {
                  return (
                    <div class={styles.option} key={item}>
                      <p
                        class={styles.question}
                        key={item}
                        onClick$={() => {
                          queryValue.value = item;
                        }}
                      >
                        {item}
                      </p>
                      <button
                        class={styles.delete}
                        onClick$={async () => {
                          if (
                            !confirm(
                              `確定要刪除「${item}」嗎？\n刪除後將無法復原！`
                            )
                          )
                            return;
                          queryOptionsPrivate.value = (
                            await getQueryOptions("remove", item)
                          )[1];
                        }}
                      >
                        刪除
                      </button>
                      <button
                        class={styles.delete}
                        key={item}
                        onClick$={() => {
                          queryValue.value = item;
                        }}
                      >
                        使用
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      {hideOptions.value && (
        <div class={styles.conversation}>
          {conversation.value.map((item) => (
            <div
              class={
                item.type === "user" ? styles.item : [styles.item, styles.bot]
              }
              key={new Date().toISOString()}
            >
              <p class={styles.content}>
                {item.type === "user" && (
                  <div class={styles.type}>
                    {(session?.value as any)?.user?.username
                      ? `${(session?.value as any)?.user?.username}: `
                      : session?.value?.user?.email
                        ? `${session?.value?.user?.email}: `
                        : "用戶："}
                  </div>
                )}
                {item.content.split("\n").map((line) => (
                  <>
                    {line.split("**").map((word, index) => (
                      <>
                        {index % 2 === 0 ? (
                          word
                            .split("*")
                            .map((word, index) => (
                              <>
                                {index % 2 === 0 ? (
                                  word
                                ) : (
                                  <span class={styles.italic}>{word}</span>
                                )}
                              </>
                            ))
                        ) : (
                          <span class={styles.bold}>{word}</span>
                        )}
                      </>
                    ))}
                    <br />
                  </>
                ))}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
});
