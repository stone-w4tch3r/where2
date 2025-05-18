import { Controller, Post, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { DataImporterService } from "./data-importer.service";

@Controller("admin/importer")
export class DataImporterController {
  constructor(private readonly dataImporterService: DataImporterService) {}

  private static readonly logger = new Logger(DataImporterController.name);

  @Post("import-yandex-data")
  @HttpCode(HttpStatus.OK)
  async importYandexData(): Promise<{ message: string }> {
    DataImporterController.logger.log(
      "Requested Yandex data import via admin endpoint",
    );
    const result = await this.dataImporterService.importAllData();
    if (!result.success) throw result.error;
    return { message: "Yandex data import completed" };
  }
}
