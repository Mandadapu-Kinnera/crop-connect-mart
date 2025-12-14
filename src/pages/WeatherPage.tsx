import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  forecast: ForecastDay[];
  alerts: string[];
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

const WeatherPage = () => {
  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    try {
      // Using Open-Meteo API (free, no API key required)
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast.error("City not found. Please try another location.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
      );
      const weatherData = await weatherResponse.json();

      const getCondition = (code: number) => {
        if (code === 0) return { condition: "Clear sky", icon: "sun" };
        if (code <= 3) return { condition: "Partly cloudy", icon: "cloud" };
        if (code <= 49) return { condition: "Foggy", icon: "cloud" };
        if (code <= 69) return { condition: "Rainy", icon: "rain" };
        if (code <= 79) return { condition: "Snowy", icon: "cloud" };
        if (code <= 99) return { condition: "Thunderstorm", icon: "rain" };
        return { condition: "Unknown", icon: "cloud" };
      };

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const forecast: ForecastDay[] = weatherData.daily.time.slice(1, 6).map((date: string, index: number) => {
        const d = new Date(date);
        const conditionData = getCondition(weatherData.daily.weather_code[index + 1]);
        return {
          day: days[d.getDay()],
          high: Math.round(weatherData.daily.temperature_2m_max[index + 1]),
          low: Math.round(weatherData.daily.temperature_2m_min[index + 1]),
          condition: conditionData.condition,
          icon: conditionData.icon,
        };
      });

      const currentCondition = getCondition(weatherData.current.weather_code);
      
      // Generate farming alerts based on weather
      const alerts: string[] = [];
      if (weatherData.current.temperature_2m > 35) {
        alerts.push("High temperature alert: Ensure adequate irrigation for crops.");
      }
      if (weatherData.current.relative_humidity_2m > 80) {
        alerts.push("High humidity: Watch for fungal diseases in crops.");
      }
      if (weatherData.current.wind_speed_10m > 30) {
        alerts.push("Strong winds expected: Secure greenhouse structures.");
      }
      if (currentCondition.icon === "rain") {
        alerts.push("Rain expected: Good time for sowing, delay pesticide application.");
      }

      setWeather({
        location: name,
        temperature: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        condition: currentCondition.condition,
        icon: currentCondition.icon,
        forecast,
        alerts,
      });
    } catch (error) {
      toast.error("Failed to fetch weather data. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getWeatherIcon = (icon: string, size = "w-12 h-12") => {
    switch (icon) {
      case "sun":
        return <Sun className={`${size} text-yellow-500`} />;
      case "rain":
        return <CloudRain className={`${size} text-blue-500`} />;
      default:
        return <Cloud className={`${size} text-gray-500`} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Weather Alerts for Farmers
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get real-time weather updates and farming recommendations for your area.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto mb-10">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Loading..." : "Search"}
              </Button>
            </form>

            {weather && (
              <div className="space-y-8">
                {/* Current Weather */}
                <Card variant="elevated" className="max-w-2xl mx-auto">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {weather.location}
                        </h2>
                        <p className="text-5xl font-bold mt-2">{weather.temperature}°C</p>
                        <p className="text-muted-foreground mt-1">{weather.condition}</p>
                      </div>
                      {getWeatherIcon(weather.icon, "w-24 h-24")}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Humidity</p>
                          <p className="font-semibold">{weather.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Wind</p>
                          <p className="font-semibold">{weather.windSpeed} km/h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Feels like</p>
                          <p className="font-semibold">{weather.temperature}°C</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Farming Alerts */}
                {weather.alerts.length > 0 && (
                  <Card className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle className="w-5 h-5" />
                        Farming Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weather.alerts.map((alert, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">Tip</Badge>
                            <span className="text-muted-foreground">{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 5-Day Forecast */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {weather.forecast.map((day, index) => (
                      <Card key={index} className="text-center p-4">
                        <p className="font-medium">{day.day}</p>
                        <div className="my-2 flex justify-center">
                          {getWeatherIcon(day.icon, "w-8 h-8")}
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">{day.high}°</span>
                          <span className="text-muted-foreground"> / {day.low}°</span>
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WeatherPage;
