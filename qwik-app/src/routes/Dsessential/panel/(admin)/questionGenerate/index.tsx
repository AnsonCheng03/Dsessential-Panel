import { $, component$, useSignal } from "@builder.io/qwik";
import styles from "./index.module.css";
import { AutoCompleteBox } from "~/components/react/SearchBar";
import { ChatGPTAPI } from "chatgpt";
import { server$ } from "@builder.io/qwik-city";

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

const downloadAsWord = server$(async function (
  conversation: {
    type: string;
    content: string;
    id?: string;
  }[]
) {
  // only get responses from the bot
  const botResponses = conversation.filter((item) => item.type === "bot");
  const botResponsesText = botResponses.map((item) => item.content).join("\n");

  const rawVideo = await fetch(
    `${process.env.BACKEND_ADDRESS}:3500/gpt-generator/downloadRecord`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.sharedMap.get("session").accessToken}`,
      },
      body: JSON.stringify({
        text: botResponsesText,
      }),
    }
  );
  return [`${process.env.BACKEND_ADDRESS}:3500/video`, await rawVideo.text()];
});

export default component$(() => {
  const queryValue = useSignal("");
  const waitingResponse = useSignal(false);
  const queryOptions = useSignal([
    "[閱讀理解] - 閱讀六層次是複述，解釋，重整，伸展，評鑒，創意，是教育局對中文閱讀理解的設題要求。試就此六項要求，各設計一題閱讀理解題目，連同250字短文和答案一併顯示。",
    "[重組句子] - 現在，請你出五題重組句子的題目。需要重組的詞語以 ／／ 隔開，並在題目下面寫下完整答案。",
    "[詞語填充] - 請出十題中文的填充題，每一題都是一句完整句子。答案請以粗體字標示。該十題填充題可供填充的詞語包括： 上班，上課，疲憊，禮尚往來，目不識丁，如法泡製，根本，面授，生日，喜悅",
    "[排句成段] - 現在，請你出1題排句成段的題目。需要重排的句子以 ／／ 隔開，每組題目需要有6句不順序的獨立句，並在題目下面寫下完整答案。",
    "[標點符號] - 請你出一份標點符號練習，練習以文章的方式呈現，內有20個標點符號填空，並附答案。使用的標點符號：逗號 句號 感嘆號 分號 引號 省略號",
    "[改寫句子] - 請出5句改寫句子練習，並附答案。改寫句子的內容有關：把直述句改寫成被動句。",
    "[擴張句子] - 請出5句擴張句子練習，並附答案。每題題目中，每句句子要擴張的範圍應以問句形式出現，並要以（）顯示。",
    "[撮寫句子] - 請出5句撮寫句子練習，並附答案。每題題目中，每句句子要撮要成只有主語，謂語和賓語。",
    "[修辭手法] - 請出5句修辭手法練習，並附答案。每題題目中，只有一種修辭手法。考生需判斷該句用了什麼手法。答案範圍：比喻 擬人 排比 反問 誇張 借代",
    "[句式判斷] - 請出5句句式判斷練習，並附答案。每題題目中，只有一種句式。考生需判斷該句用了什麼手法。答案範圍：反問句 疑問句 設問句",
    "[閱讀理解] - 請以以下文章，撰寫一份40分的閱讀理解題目，並附答案。每1題的分值由2分至6分，每個答案重點值1分。題目需涵蓋分段，段旨，修辭手法運用，寫作手法運用，深度分析題目。撰寫答案時，請標明每1分的出處。",
  ]);
  const conversation = useSignal<
    {
      type: string;
      content: string;
      id?: string;
    }[]
  >([]);
  const parentID = useSignal<string | null>(null);

  const submitQuery = $(async () => {
    if (queryOptions.value.length !== 0) queryOptions.value = [];
    const queryElement = document.querySelector(`.${styles.queryBar} input`);
    if (queryElement && (queryElement as any).value)
      queryValue.value = (queryElement as any).value;
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
          onClick$={submitQuery}
          disabled={waitingResponse.value}
        >
          生成
        </button>
        <button
          class={styles.button}
          onClick$={() => {
            downloadAsWord(conversation.value);
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
