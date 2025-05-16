import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

interface YandexStation {
  title: string;
  code: string;
  station_type: string;
  transport_type: string;
  latitude: number;
  longitude: number;
  country?: string;
  region?: string;
}

@Injectable()
export class YandexService {
  private apiKey: string;
  private baseUrl: string;
  private defaultLang: "ru_RU" | "uk_UA";
  private defaultFormat: "json" | "xml";

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("YANDEX_API_KEY");
    this.baseUrl = "https://api.rasp.yandex.net/v3.0";
    this.defaultLang = "ru_RU";
    this.defaultFormat = "json";
  }

  /**
   * Fetch station schedule
   */
  async getStationSchedule(params: { station: string; date?: string }) {
    try {
      const response = await axios.get(`${this.baseUrl}/schedule`, {
        params: {
          apikey: this.apiKey,
          station: params.station,
          date: params.date,
          lang: this.defaultLang,
          format: this.defaultFormat,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching station schedule: ${error}`);
    }
  }

  /**
   * Fetch thread stations
   */
  async getThreadStations(params: { uid: string }) {
    try {
      const response = await axios.get(`${this.baseUrl}/thread`, {
        params: {
          apikey: this.apiKey,
          uid: params.uid,
          lang: this.defaultLang,
          format: this.defaultFormat,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching thread stations: ${error}`);
    }
  }

  /**
   * Fetch stations list
   */
  async getStationsList(): Promise<{ stations: YandexStation[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/stations_list`, {
        params: {
          apikey: this.apiKey,
          lang: this.defaultLang,
          format: this.defaultFormat,
        },
      });

      // Transform the response to match the expected format
      const stations: YandexStation[] = [];

      // Extract stations from the countries->regions->settlements->stations structure
      response.data.countries.forEach((country) => {
        country.regions.forEach((region) => {
          region.settlements.forEach((settlement) => {
            settlement.stations.forEach((station) => {
              stations.push({
                title: station.title,
                code: station.codes.yandex_code || "",
                station_type: station.station_type || "",
                transport_type: station.transport_type,
                latitude:
                  typeof station.latitude === "number" ? station.latitude : 0,
                longitude:
                  typeof station.longitude === "number" ? station.longitude : 0,
                country: country.title,
                region: region.title,
              });
            });
          });
        });
      });

      return { stations };
    } catch (error) {
      throw new Error(`Error processing stations list: ${error}`);
    }
  }

  /**
   * Fetch schedule between stations
   */
  async getSchedule(from: string, to: string, date: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          apikey: this.apiKey,
          from,
          to,
          date,
          lang: this.defaultLang,
          format: this.defaultFormat,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching schedule: ${error}`);
    }
  }
}
