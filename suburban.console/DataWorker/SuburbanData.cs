using suburban.console.DataWorker.DTOs;

namespace suburban.console.DataWorker;

public record SuburbanData
{
    public SuburbanData(StationsRootDto rootDto)
    {
        this.CreationDate = DateTime.Now;
        this.RootCountry = rootDto.Countries.First(x => x.Title == "Россия");
    }
    
    public DateTime CreationDate { get; }
    public CountryDto RootCountry { get; }
    
    public void Deconstruct(out DateTime CreationDate, out CountryDto RootCountry)
    {
        CreationDate = this.CreationDate;
        RootCountry = this.RootCountry;
    }
}