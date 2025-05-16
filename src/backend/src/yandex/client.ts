import axios, { AxiosInstance } from "axios";

export class YandexRaspClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: "https://api.rasp.yandex.net/v3.0",
      params: {
        apikey: this.apiKey,
        format: "json",
      },
    });
  }

  async getStationsList(params: {
    country_code?: string;
    region?: string;
    transport_type?: string;
  }) {
    try {
      const response = await this.client.get("/stations_list/", {
        params: {
          ...params,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching stations list:", error);
      return { success: false, error: "Failed to fetch stations list" };
    }
  }

  async getStationSchedule(params: {
    station: string;
    date?: string;
    transport_type?: string;
  }) {
    try {
      const response = await this.client.get("/schedule/", {
        params: {
          ...params,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching station schedule:", error);
      return { success: false, error: "Failed to fetch station schedule" };
    }
  }

  async getThreadStations(params: { uid: string; date?: string }) {
    try {
      const response = await this.client.get("/thread/", {
        params: {
          ...params,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching thread stations:", error);
      return { success: false, error: "Failed to fetch thread stations" };
    }
  }
}
