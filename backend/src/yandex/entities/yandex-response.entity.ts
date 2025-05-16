import { ApiProperty } from "@nestjs/swagger";
import { YandexStation } from "./yandex-schemas";

/**
 * Represents the response from Yandex Stations List API
 */
export class StationsListResponse {
  @ApiProperty({
    description: "List of stations",
    type: [Object],
  })
  stations!: YandexStation[];
}

/**
 * Base thread information
 */
export class ThreadInfo {
  @ApiProperty()
  uid!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  short_title!: string;

  @ApiProperty()
  carrier!: {
    code: number;
    title: string;
  };

  @ApiProperty()
  transport_type!: string;
}

/**
 * Schedule Item (segment) in search results
 */
export class ScheduleSegment {
  @ApiProperty()
  arrival!: string;

  @ApiProperty()
  departure!: string;

  @ApiProperty()
  thread!: ThreadInfo;

  @ApiProperty()
  duration!: number;

  @ApiProperty()
  from!: {
    code: string;
    title: string;
  };

  @ApiProperty()
  to!: {
    code: string;
    title: string;
  };
}

/**
 * Search results response
 */
export class SearchResponse {
  @ApiProperty()
  search!: {
    date: string;
    from: {
      code: string;
      title: string;
    };
    to: {
      code: string;
      title: string;
    };
  };

  @ApiProperty({ type: [ScheduleSegment] })
  segments!: ScheduleSegment[];
}
