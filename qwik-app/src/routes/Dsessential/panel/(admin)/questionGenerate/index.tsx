import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import { ChatGPTAPI } from "chatgpt";
import { server$ } from "@builder.io/qwik-city";
import { useAuthSession } from "~/routes/plugin@auth";
import { BsDatabaseAdd, BsTrashFill } from "@qwikest/icons/bootstrap";

const gptAPI = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY!,
  completionParams: {
    model: "gpt-3.5-turbo-16k",
  },
});

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
      pushProgress([res.text, res.id, "END"]);
    });

  for await (const update of progressGenerator) {
    yield update;
  }
});

const backendAddress = server$(async function () {
  return process.env.BACKEND_ADDRESS;
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
    `${await backendAddress()}:3500/gpt-generator/downloadRecord`,
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
  action?: "append" | "remove",
  value?: string
) {
  const queryOptions = await fetch(
    `${await backendAddress()}:3500/gpt-generator/queryOptions`,
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
  const options = res.questions;
  return options;
});

export default component$(() => {
  const session = useAuthSession();
  const accessToken = (session.value as any).accessToken;
  const queryValue = useSignal("");
  const waitingResponse = useSignal(false);
  const queryOptions = useSignal<string[]>([""]);
  const conversation = useSignal<
    {
      type: string;
      content: string;
      id?: string;
    }[]
  >([]);
  const parentID = useSignal<string | null>(null);

  const submitQuery = $(async () => {
    const queryElement = document.querySelector(
      `.${styles.queryBar} input`
    ) as HTMLInputElement;
    if (queryElement.value) queryValue.value = queryElement.value;
    if (queryValue.value === "") return;
    conversation.value = [
      ...conversation.value,
      { type: "user", content: queryValue.value },
    ];
    waitingResponse.value = true;
    const res = await queryGPT(queryValue.value, parentID.value);
    for await (const i of res) {
      parentID.value = i[1];

      // Check if the id already exists
      const existingIndex = conversation.value.findIndex(
        (item) => item.id === i[1]
      );

      if (existingIndex !== -1) {
        // ID exists, replace content
        conversation.value[existingIndex].content = i[0];
        // refresh the array
        conversation.value = [...conversation.value];
      } else {
        // ID doesn't exist, add a new entry
        conversation.value = [
          ...conversation.value,
          { type: "bot", content: i[0], id: i[1] },
        ];
      }
      if (i[2] === "END") break;
    }
    waitingResponse.value = false;
  });

  useTask$(async () => {
    queryOptions.value = await getQueryOptions();
  });

  return (
    <>
      <h1 class={styles.title}>生成問題</h1>
      <form class={styles.queryBar} preventdefault:submit>
        <AutoCompleteBox
          searchValue={queryValue}
          freeSolo
          size="small"
          options={queryOptions.value}
          placeholder="請輸入問題"
          disabled={waitingResponse.value}
        />
        <button
          class={styles.button}
          onClick$={async () => {
            const queryElement = document.querySelector(
              `.${styles.queryBar} input`
            ) as HTMLInputElement;
            const value = queryElement.value;
            if (!value) return;
            queryOptions.value = await getQueryOptions("append", value);
            queryElement.focus();
          }}
        >
          <BsDatabaseAdd />
        </button>
        <button
          class={styles.button}
          onClick$={async () => {
            const queryElement = document.querySelector(
              `.${styles.queryBar} input`
            ) as HTMLInputElement;
            const value = queryElement.value;
            if (!value || !queryOptions.value.includes(value)) return;
            if (!confirm(`確定要刪除「${value}」嗎？\n刪除後將無法復原！`))
              return;
            queryOptions.value = await getQueryOptions("remove", value);
            queryElement.focus();
          }}
        >
          <BsTrashFill />
        </button>
        <button
          class={styles.button}
          onClick$={submitQuery}
          disabled={waitingResponse.value}
        >
          生成
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
      </form>
      <div class={styles.conversation}>
        {conversation.value.map((item) => (
          <div
            class={
              item.type === "user" ? styles.item : [styles.item, styles.bot]
            }
            key={new Date().toISOString()}
          >
            <div class={styles.type}>{item.type}</div>
            <p class={styles.content}>
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
    </>
  );
});
