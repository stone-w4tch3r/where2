export const yandexApiConfig = {
  baseUrl: "https://api.rasp.yandex.net/v3.0/",
  apiKey: process.env.YANDEX_API_KEY,
  defaultParams: {
    format: "json" as const,
    lang: "ru_RU" as const,
  },
};
