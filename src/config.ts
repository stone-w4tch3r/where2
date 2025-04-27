export const apiConfig = {
  yandex: {
    baseUrl: "https://api.rasp.yandex.net/v3.0/",
    apiKey: "741883ec-2d53-4830-aa83-fa17b38c1f66",
    defaultParams: {
      format: "json" as const,
      lang: "ru_RU" as const,
    },
  },
};

export const appConfig = {};

export const envConfig = {};

const config = {
  api: apiConfig,
  app: appConfig,
  env: envConfig,
};

export default config;
