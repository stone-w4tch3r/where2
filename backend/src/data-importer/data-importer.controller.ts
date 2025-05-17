import { Controller, Post, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { DataImporterService } from "./data-importer.service";

@Controller("api/admin")
export class DataImporterController {
  constructor(private readonly dataImporterService: DataImporterService) {}

  private static readonly logger = new Logger(DataImporterController.name);

  @Post("import-yandex-data")
  @HttpCode(HttpStatus.OK)
  async importYandexData() {
    DataImporterController.logger.log(
      "Requested Yandex data import via admin endpoint",
    );
    await this.dataImporterService.importAllData();
    return { message: "Yandex data import completed" };
  }
}
