import axios from "axios";
import chalk from "chalk";
import { ZodError, ZodSchema } from "zod";
import {
  stationsListResponseSchema,
  betweenStationsScheduleResponseSchema,
  BetweenStationsScheduleParams,
  stationScheduleResponseSchema,
  StationScheduleParams,
} from "./src/api";
import { writeFileSync } from "fs";

const SAVE_DEBUG_FILE = true;

interface ValidationConfig {
  apiKey: string;
  endpoints: {
    [key: string]: {
      url: string;
      schema: ZodSchema;
      params: Record<string, any>;
    };
  };
}

const config: ValidationConfig = {
  apiKey: "741883ec-2d53-4830-aa83-fa17b38c1f66",
  endpoints: {
    // stationsList: {
    //   url: "https://api.rasp.yandex.net/v3.0/stations_list/",
    //   schema: stationsListResponseSchema,
    //   params: {
    //     format: "json",
    //     lang: "ru_RU",
    //   },
    // },
    // betweenStations: {
    //   url: "https://api.rasp.yandex.net/v3.0/search/",
    //   schema: betweenStationsScheduleResponseSchema,
    //   params: {
    //     from: "s9607404", // Екатеринбург-Пасс.
    //     to: "s9607483", // Нижний Тагил
    //     date: new Date().toISOString().split("T")[0],
    //   } as BetweenStationsScheduleParams,
    // },
    stationSchedule: {
      url: "https://api.rasp.yandex.net/v3.0/schedule/",
      schema: stationScheduleResponseSchema,
      params: {
        station: "s9600213", // Sheremetyevo
      } as StationScheduleParams,
    },
  },
};

interface ValidationResult {
  endpoint: string;
  success: boolean;
  validationError?: ZodError;
  rawData?: any;
  parsedData?: any;
}

async function validateEndpoint(
  endpoint: string,
  url: string,
  schema: ZodSchema,
  params: Record<string, any>
): Promise<ValidationResult> {
  try {
    console.log(chalk.blue(`\nValidating ${endpoint}...`));

    // Print the final request URL with params
    const fullUrl = new URL(url);
    fullUrl.searchParams.append("apikey", config.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      fullUrl.searchParams.append(key, value);
    });
    console.log(chalk.gray("Request URL:"), fullUrl.toString());

    // Pause for confirmation
    await new Promise((resolve) => {
      console.log(chalk.yellow("Press Enter to continue..."));
      process.stdin.once("data", () => resolve(undefined));
    });

    const response = await axios.get(url, {
      params: {
        apikey: config.apiKey,
        ...params,
      },
    });

    const rawData = response.data;
    let parsedData;

    try {
      parsedData = schema.parse(rawData);

      return {
        endpoint,
        success: true,
        rawData,
        parsedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          endpoint,
          success: false,
          validationError: error,
          rawData,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error(chalk.red(`Error fetching ${endpoint}:`), error);
    throw error;
  }
}

function printValidationError(error: ZodError) {
  console.log(chalk.red("\nValidation Errors:"));
  error.errors.forEach((err) => {
    console.log(chalk.yellow("\nPath:"), err.path.join("."));
    console.log(chalk.yellow("Error:"), err.message);
    if (err.code === "invalid_type") {
      console.log(chalk.gray("Expected:"), err.expected);
      console.log(chalk.gray("Received:"), err.received);
    }
  });
}

async function validateAllEndpoints() {
  console.log(chalk.green("Starting schema validation...\n"));

  const results: ValidationResult[] = [];

  for (const [endpoint, cfg] of Object.entries(config.endpoints)) {
    try {
      const result = await validateEndpoint(
        endpoint,
        cfg.url,
        cfg.schema,
        cfg.params
      );
      results.push(result);
    } catch (error) {
      console.error(chalk.red(`Failed to validate ${endpoint}`), error);
    }
  }

  // Print results summary
  console.log(chalk.green("\n=== Validation Results ===\n"));

  results.forEach((result) => {
    console.log(chalk.blue(`\nEndpoint: ${result.endpoint}`));

    if (result.success) {
      console.log(chalk.green("✓ Schema validation passed"));
    } else {
      console.log(chalk.red("✗ Schema validation failed"));

      if (result.validationError) {
        printValidationError(result.validationError);
      }
    }
  });

  // Save failed validations for debugging
  const failedValidations = results.filter((r) => !r.success);
  if (failedValidations.length > 0 || SAVE_DEBUG_FILE) {
    const debugData = results
      .filter((result) => !result.success || SAVE_DEBUG_FILE)
      .map((result) => ({
        endpoint: result.endpoint,
        rawData: result.rawData,
        parsedData: result.parsedData,
        validationError: result.validationError?.errors,
      }));

    writeFileSync(
      "schema-validation-debug.json",
      JSON.stringify(debugData, null, 2)
    );

    console.log(
      chalk.yellow(
        "\nDebug data for validations saved to schema-validation-debug.json"
      )
    );
  }
}

// Run validation if executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  validateAllEndpoints()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { validateAllEndpoints, validateEndpoint };
