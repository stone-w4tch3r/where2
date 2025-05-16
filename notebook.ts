import {
  fetchStationSchedule,
  fetchStationsList,
} from "./backend/src/yandex/endpoints";
import fs from "fs";

async function saveXToJson() {
  try {
    // const result = await fetchStationsList({ lang: "ru_RU", format: "json" });
    const result = await fetchStationSchedule({ station: "s9607404" });

    if (result.success) {
      const stationsData = result.data;
      const fileName = "ekb_schedule.json";
      fs.writeFileSync(fileName, JSON.stringify(stationsData, null, 2));
      console.log(`Data saved to ${fileName}`);
    } else {
      console.error("Failed to fetch data:", result.error);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

saveXToJson();
