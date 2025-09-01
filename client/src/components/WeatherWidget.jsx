import { useEffect, useState } from "react";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState("");
  const [adviceColor, setAdviceColor] = useState("text-green-600");
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API request failed");

        const data = await res.json();
        setWeather(data);

        if (data.weather && data.weather[0]) {
          if (data.weather[0].main === "Rain") {
            setAdvice(" It's raining, better to reschedule");
            setAdviceColor("text-red-600");
          } else if (data.main.temp > 35) {
            setAdvice(" Too hot, stay indoors unless necessary");
            setAdviceColor("text-orange-600");
          } else if (data.main.temp < 10) {
            setAdvice(" It's cold, dress warmly if you go out");
            setAdviceColor("text-orange-600");
          } else {
            setAdvice("Weather looks fine, safe to go outside");
            setAdviceColor("text-green-600");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to fetch weather right now.");
      }
    });
  }, []);

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!weather)
    return <p className="text-gray-600 text-center">Loading weather...</p>;

  return (
    <div className="text-center mt-6">
      <div className="flex flex-wrap justify-center gap-8 text-lg font-medium">
        <p>Location: {weather.name}</p>
        <p>Temp: {weather.main.temp}°C</p>
        <p>Feels Like: {weather.main.feels_like}°C</p>
        <p>Sky: {weather.weather[0].main}</p>
        <p>Humidity: {weather.main.humidity}% </p>
        <p>Wind: {weather.wind.speed} m/s </p>
      </div>

      <p className={`mt-6 text-xl font-semibold ${adviceColor}`}>{advice}</p>
    </div>
  );
}
