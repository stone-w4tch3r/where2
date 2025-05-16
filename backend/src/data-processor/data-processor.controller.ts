import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { DataProcessorService } from "./data-processor.service";

@Controller("api/admin")
export class DataProcessorController {
  constructor(private readonly dataProcessorService: DataProcessorService) {}

  @Post("process-data")
  @HttpCode(HttpStatus.OK)
  async processData() {
    await this.dataProcessorService.processAllData();
    return { message: "Data import triggered" };
  }
}
