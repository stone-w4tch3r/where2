// validate-schemas.ts
import axios from 'axios'
import chalk from 'chalk'
import { diff } from 'deep-object-diff'
import { ZodError, ZodSchema } from 'zod'
import { stationsListResponseSchema } from './stations-list-schemas'
import { stationScheduleResponseSchema } from './stations-endpoint'

interface ValidationConfig {
  apiKey: string
  endpoints: {
    [key: string]: {
      url: string
      schema: ZodSchema
      params: Record<string, any>
    }
  }
}

const config: ValidationConfig = {
  apiKey: process.env.YANDEX_SCHEDULE_API_KEY || '',
  endpoints: {
    stationsList: {
      url: 'https://api.rasp.yandex.net/v3.0/stations_list/',
      schema: stationsListResponseSchema,
      params: {
        format: 'json',
        lang: 'ru_RU'
      }
    },
    stationSchedule: {
      url: 'https://api.rasp.yandex.net/v3.0/schedule/',
      schema: stationScheduleResponseSchema,
      params: {
        station: 's9600213', // Sheremetyevo
        transport_types: 'plane',
        date: new Date().toISOString().split('T')[0]
      }
    }
  }
}

interface ValidationResult {
  endpoint: string
  success: boolean
  validationError?: ZodError
  rawData?: any
  parsedData?: any
  diff?: any
}

async function validateEndpoint(
  endpoint: string,
  url: string,
  schema: ZodSchema,
  params: Record<string, any>
): Promise<ValidationResult> {
  try {
    console.log(chalk.blue(`\nValidating ${endpoint}...`))
    
    const response = await axios.get(url, {
      params: {
        apikey: config.apiKey,
        ...params
      }
    })

    const rawData = response.data
    let parsedData

    try {
      parsedData = schema.parse(rawData)
      const differences = diff(rawData, parsedData)
      
      if (Object.keys(differences).length > 0) {
        return {
          endpoint,
          success: false,
          rawData,
          parsedData,
          diff: differences
        }
      }

      return {
        endpoint,
        success: true,
        rawData,
        parsedData
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          endpoint,
          success: false,
          validationError: error,
          rawData
        }
      }
      throw error
    }

  } catch (error) {
    console.error(chalk.red(`Error fetching ${endpoint}:`), error)
    throw error
  }
}

function printValidationError(error: ZodError) {
  console.log(chalk.red('\nValidation Errors:'))
  error.errors.forEach((err) => {
    console.log(chalk.yellow('\nPath:'), err.path.join('.'))
    console.log(chalk.yellow('Error:'), err.message)
    if (err.code === 'invalid_type') {
      console.log(chalk.gray('Expected:'), err.expected)
      console.log(chalk.gray('Received:'), err.received)
    }
  })
}

function printDataDiff(differences: any, path: string[] = []) {
  Object.entries(differences).forEach(([key, value]) => {
    const currentPath = [...path, key]
    
    if (value && typeof value === 'object') {
      printDataDiff(value, currentPath)
    } else {
      console.log(
        chalk.yellow('\nPath:'), 
        currentPath.join('.'),
        '\n' + chalk.gray('Difference:'), 
        value
      )
    }
  })
}

async function validateAllEndpoints() {
  console.log(chalk.green('Starting schema validation...\n'))
  
  const results: ValidationResult[] = []

  for (const [endpoint, config] of Object.entries(config.endpoints)) {
    try {
      const result = await validateEndpoint(
        endpoint,
        config.url,
        config.schema,
        config.params
      )
      results.push(result)
    } catch (error) {
      console.error(chalk.red(`Failed to validate ${endpoint}`), error)
    }
  }

  // Print results summary
  console.log(chalk.green('\n=== Validation Results ===\n'))
  
  results.forEach((result) => {
    console.log(chalk.blue(`\nEndpoint: ${result.endpoint}`))
    
    if (result.success) {
      console.log(chalk.green('✓ Schema validation passed'))
    } else {
      console.log(chalk.red('✗ Schema validation failed'))
      
      if (result.validationError) {
        printValidationError(result.validationError)
      }
      
      if (result.diff) {
        console.log(chalk.red('\nData Differences:'))
        printDataDiff(result.diff)
      }
    }
  })

  // Save failed validations for debugging
  const failedValidations = results.filter(r => !r.success)
  if (failedValidations.length > 0) {
    const debugData = failedValidations.map(result => ({
      endpoint: result.endpoint,
      rawData: result.rawData,
      parsedData: result.parsedData,
      validationError: result.validationError?.errors,
      diff: result.diff
    }))

    const fs = require('fs')
    fs.writeFileSync(
      'schema-validation-debug.json',
      JSON.stringify(debugData, null, 2)
    )
    
    console.log(chalk.yellow(
      '\nDebug data for failed validations saved to schema-validation-debug.json'
    ))
  }
}

// Run validation if executed directly
if (require.main === module) {
  validateAllEndpoints().catch(console.error)
}

export { validateAllEndpoints, validateEndpoint }