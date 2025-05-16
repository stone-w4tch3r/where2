import axios, { AxiosRequestConfig } from "axios";
import { z } from "zod";
import { Result, ResultUtils } from "../utils/Result";
import { yandexApiConfig } from "./apiConfig";

/**
 * Makes an API request and handles common error patterns
 * @param url - API endpoint URL
 * @param schema - Zod schema for validating the response
 * @param config - Axios request configuration
 * @returns Result with parsed data or error message
 */
export async function makeApiRequest<T>(
  url: string,
  schema: z.ZodSchema<T>,
  requestConfig: AxiosRequestConfig
): Promise<Result<T>> {
  try {
    const response = await axios.get(url, requestConfig);
    const parsedData = schema.parse(response.data);
    return ResultUtils.success(parsedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ResultUtils.error(`Data validation error: ${error.message}`);
    }

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const responseData = error.response?.data;

      // Handle common API errors with more specific messages
      if (statusCode === 401) {
        return ResultUtils.error("API key is invalid or missing");
      } else if (statusCode === 404) {
        return ResultUtils.error("Requested resource not found");
      } else if (statusCode === 429) {
        return ResultUtils.error("Rate limit exceeded. Try again later.");
      }

      // General error with response details when available
      const errorMessage = responseData?.error?.text || error.message;
      return ResultUtils.error(`API request failed: ${errorMessage}`);
    }

    return ResultUtils.error(`Unknown error: ${String(error)}`);
  }
}

/**
 * Helper function specifically for Yandex Schedule API requests
 * @param endpoint - API endpoint path (without base URL)
 * @param schema - Zod schema for validating the response
 * @param params - Request parameters
 * @returns Result with parsed data or error message
 */
export async function makeYandexApiRequest<T>(
  endpoint: string,
  schema: z.ZodSchema<T>,
  params: Record<string, any> = {}
): Promise<Result<T>> {
  const baseUrl = yandexApiConfig.baseUrl;
  const apiKey = yandexApiConfig.apiKey;

  return makeApiRequest(baseUrl + endpoint, schema, {
    params: {
      apikey: apiKey,
      ...yandexApiConfig.defaultParams,
      ...params,
    },
  });
}
