import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { DataImporterService } from "./data-importer.service";

@Controller("api/admin")
export class DataImporterController {
  constructor(private readonly dataImporterService: DataImporterService) {}

  @Post("import-yandex-data")
  @HttpCode(HttpStatus.OK)
  async importYandexData() {
    console.log("Requested Yandex data import via admin endpoint");
    await this.dataImporterService.importAllData();
    return { message: "Yandex data import completed" };
  }
}
