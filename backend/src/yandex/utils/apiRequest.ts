import { Logger } from "@nestjs/common";
import axios from "axios";
import { ZodSchema } from "zod";
import { URLSearchParams } from "url";
import { Result, resultSuccess, resultError } from "../../utils/Result";
import { AppError, InternalError } from "../../utils/errors";
import { getErrorMessage } from "../../utils/errorHelpers";

const logger = new Logger("YandexAPI");

/**
 * Makes a request to the Yandex API and validates the response
 *
 * @param endpoint - The API endpoint to call
 * @param params - Request parameters
 * @param responseSchema - Zod schema for validating the response
 * @param config - API configuration
 * @returns Result with parsed data or error
 */
export async function makeApiRequest<TParams, TResponse>(
  endpoint: string,
  params: TParams,
  responseSchema: ZodSchema<TResponse>,
  config: {
    baseUrl: string;
    apiKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultParams: Record<string, any>;
  },
): Promise<Result<TResponse, AppError>> {
  const { baseUrl, apiKey, defaultParams } = config;
  const url = baseUrl + endpoint;

  const requestParams = {
    apikey: apiKey,
    ...defaultParams,
    ...params,
  };

  // Construct full URL for logging (including query parameters)
  const fullUrl = constructFullUrl(url, requestParams);
  logger.verbose(`Making request to: ${fullUrl}`);

  try {
    const response = await axios.get(url, { params: requestParams });

    logger.verbose(`Response status: ${response.status}`);

    try {
      const parsedData = responseSchema.parse(response.data);
      return resultSuccess(parsedData);
    } catch (parseError) {
      const message = `Response validation error: ${getErrorMessage(parseError)}`;
      return resultError(new InternalError(message));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return resultError(new InternalError(message));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function constructFullUrl(url: string, params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });
  return `${url}?${queryParams.toString()}`;
}
