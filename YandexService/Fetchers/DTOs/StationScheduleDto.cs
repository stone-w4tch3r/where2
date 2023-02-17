using YandexService.DataTypes;

namespace YandexService.Fetchers.DTOs;

public record StationScheduleDto : IDto;

// Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class Carrier
    {
        public int code { get; set; }
        public string title { get; set; }
        public Codes codes { get; set; }
    }

    public class Direction
    {
        public string code { get; set; }
        public string title { get; set; }
    }

    public class Pagination
    {
        public int total { get; set; }
        public int limit { get; set; }
        public int offset { get; set; }
    }

    public class Root
    {
        public object date { get; set; }
        public Station station { get; set; }
        public Pagination pagination { get; set; }
        public List<Schedule> schedule { get; set; }
        public List<object> interval_schedule { get; set; }
        public List<Direction> directions { get; set; }
        public ScheduleDirection schedule_direction { get; set; }
    }

    public class Schedule
    {
        public Thread thread { get; set; }
        public bool is_fuzzy { get; set; }
        public string platform { get; set; }
        public object terminal { get; set; }
        public string days { get; set; }
        public object except_days { get; set; }
        public string stops { get; set; }
        public string direction { get; set; }
        public string departure { get; set; }
        public string arrival { get; set; }
    }

    public class ScheduleDirection
    {
        public string code { get; set; }
        public string title { get; set; }
    }

    public class Thread
    {
        public string number { get; set; }
        public string title { get; set; }
        public string short_title { get; set; }
        public string express_type { get; set; }
        public string transport_type { get; set; }
        public Carrier carrier { get; set; }
        public string uid { get; set; }
        public object vehicle { get; set; }
        public TransportSubtype transport_subtype { get; set; }
    }

    public class TransportSubtype
    {
        public string title { get; set; }
        public string code { get; set; }
        public string color { get; set; }
    }

