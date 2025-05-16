# Migration Plan: Express.js to NestJS

## Overview

This document outlines the step-by-step process to migrate the current Express.js backend to NestJS. The migration will maintain all existing functionality while leveraging NestJS's modular architecture and decorators.

## Current Architecture

- **Express.js API** with controllers, services, and routes
- **Prisma ORM** for database interactions
- **Yandex.Rasp API client** for external data fetching
- **Cron jobs** for scheduled data processing
- Services for stations, routes, and transfer calculations

## Migration Steps

### 1. Setup NestJS Project

1. Create a new NestJS project in a temporary directory:

   ```bash
   npm i -g @nestjs/cli
   nest new temp-nest-backend
   ```

2. Copy over essential configuration files:

   - `tsconfig.json` (update with NestJS-specific settings)
   - `.env` and `.env.example`
   - `prisma/` directory

3. Update package.json with current dependencies plus NestJS ones:
   ```json
   "dependencies": {
     "@nestjs/common": "^x.x.x",
     "@nestjs/core": "^x.x.x",
     "@nestjs/platform-express": "^x.x.x",
     "@nestjs/schedule": "^x.x.x",
     "@nestjs/swagger": "^x.x.x",
     "@prisma/client": "^x.x.x",
     "axios": "^x.x.x",
     "dotenv": "^x.x.x",
     "node-cron": "^x.x.x",
     "zod": "^x.x.x"
   }
   ```

### 2. Setup NestJS Module Structure

Create the following structure:

```
src/
├── app.module.ts           # Main application module
├── main.ts                 # Application entry point
├── prisma/                 # Prisma service module
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── stations/               # Station module
│   ├── stations.module.ts
│   ├── stations.controller.ts
│   ├── stations.service.ts
│   └── dto/                # Data Transfer Objects
├── routes/                 # Route module
│   ├── routes.module.ts
│   ├── routes.controller.ts
│   ├── routes.service.ts
│   └── dto/
├── reachability/           # Reachability/Transfer module
│   ├── reachability.module.ts
│   ├── reachability.controller.ts
│   ├── reachability.service.ts
│   └── dto/
├── yandex/                 # Yandex API module
│   ├── yandex.module.ts
│   ├── yandex.service.ts
│   └── entities/
└── data-processor/         # Data processing module
    ├── data-processor.module.ts
    ├── data-processor.service.ts
    └── data-processor.controller.ts (for admin endpoints)
```

### 3. Create Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// src/prisma/prisma.module.ts
import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 4. Migrate Services

For each service, convert the current Express service to a NestJS injectable service.

Example for StationService:

```typescript
// src/stations/stations.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.station.findMany();
  }

  async findOne(id: string) {
    return this.prisma.station.findUnique({
      where: { id },
    });
  }

  // Other existing methods...
}
```

### 5. Migrate Controllers

Convert the current Express controllers to NestJS controllers using decorators.

Example for StationController:

```typescript
// src/stations/stations.controller.ts
import { Controller, Get, Param, Query } from "@nestjs/common";
import { StationsService } from "./stations.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("stations")
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @ApiOperation({ summary: "Get all stations" })
  @Get()
  findAll() {
    return this.stationsService.findAll();
  }

  @ApiOperation({ summary: "Get station by ID" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.stationsService.findOne(id);
  }

  // Other existing endpoints...
}
```

### 6. Setup Modules

Create modules to organize and encapsulate related components.

Example for Stations module:

```typescript
// src/stations/stations.module.ts
import { Module } from "@nestjs/common";
import { StationsService } from "./stations.service";
import { StationsController } from "./stations.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
```

### 7. Implement Yandex API Client

```typescript
// src/yandex/yandex.service.ts
import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class YandexService {
  private apiKey: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("YANDEX_API_KEY");
    this.baseUrl = "https://api.rasp.yandex.net/v3.0";
  }

  // Implement existing YandexRaspClient methods
}
```

### 8. Implement Data Processor with Scheduling

```typescript
// src/data-processor/data-processor.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { YandexService } from "../yandex/yandex.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DataProcessorService {
  private readonly logger = new Logger(DataProcessorService.name);

  constructor(
    private yandexService: YandexService,
    private prisma: PrismaService
  ) {}

  @Cron("0 0 * * *") // Run daily at midnight
  async handleDailyDataProcessing() {
    this.logger.log("Running daily data processing");
    await this.processAllData();
  }

  async processAllData() {
    // Implement existing data processor logic
  }
}
```

### 9. Implement App Module

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { StationsModule } from "./stations/stations.module";
import { RoutesModule } from "./routes/routes.module";
import { ReachabilityModule } from "./reachability/reachability.module";
import { YandexModule } from "./yandex/yandex.module";
import { DataProcessorModule } from "./data-processor/data-processor.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StationsModule,
    RoutesModule,
    ReachabilityModule,
    YandexModule,
    DataProcessorModule,
  ],
})
export class AppModule {}
```

### 10. Create Main.ts Entry Point

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Setup validation
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle("Where2 API")
    .setDescription("API for the Where2 application")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start the server
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

### 11. Implement DTO Classes

Create Data Transfer Objects for request/response validation:

```typescript
// src/stations/dto/station.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class StationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  popularName?: string;

  @ApiProperty({ required: false })
  shortName?: string;

  @ApiProperty()
  transportMode: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  region?: string;
}
```

### 12. Testing

Not needed

### 13. Graceful Shutdown

Implement graceful shutdown in main.ts:

```typescript
// Add to main.ts
async function bootstrap() {
  // ... existing code ...

  // Handle shutdown signals
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await app.close();
    process.exit(0);
  });
}
```
