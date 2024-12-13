import { createMessage, ChatMessage, ChatSession } from "../store/chat";
import { ClientApi, getClientApi } from "../client/api";
import { ServiceProvider } from "../constant";

export async function translate_to_english(
  content: string,
  session: ChatSession,
): Promise<string> {
  const message: ChatMessage = createMessage({
    role: "user",
    content: content,
  });

  const modelConfig = session.mask.modelConfig;

  const [model, providerName] = [
    modelConfig.translateModel,
    modelConfig.translateProviderName,
  ];

  const api: ClientApi = getClientApi(providerName as ServiceProvider);

  let prePrompt: string =
    "I want you to act as an English translator, spelling corrector and improver.I will speak to you in any language and you will detect the language, translate it in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations.The following needs to be translated:";

  const translateMessage: ChatMessage[] = [
    createMessage({
      role: "user",
      content: prePrompt,
    }),
    message,
  ];

  // 使用 Promise 包装异步回调
  return new Promise((resolve, reject) => {
    api.llm.chat({
      messages: translateMessage,
      config: {
        model,
        stream: false,
        providerName,
      },
      onFinish(message, responseRes) {
        if (responseRes?.status === 200) {
          resolve(message); // 将结果传递给 Promise 的 resolve
        } else {
          reject(
            new Error(
              "fail to tranlate key, check if you have provide a api key for translate model",
            ),
          ); // 失败时调用 reject
        }
      },
    });
  });
}
