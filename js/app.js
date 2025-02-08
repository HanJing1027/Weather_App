import { OPENWEATHER_API_KEY } from "./config.js";
import { cityDictionary } from "./cityMapper.js";

const cityInput = document.querySelector(".weather-input input");
const weatherCards = document.querySelector(".weather-cards");
const searchBtn = document.querySelector(".search-btn");

// 渲染cards
const createWeatherCard = (weatherItem) => {
  return `
    <li class="card">
      <h2>( ${weatherItem.dt_txt.split(" ")[0]} )</h2>
      <img
        src="https:/openweathermap.org/img/wn/${
          weatherItem.weather[0].icon
        }@2x.png"
        alt="weather-icon"
      />
      <h4>溫度: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
      <h4>風速: ${weatherItem.wind.speed} M/S</h4>
      <h4>濕度: ${weatherItem.main.humidity} %</h4>
    </li>
  `;
};

// 取得天氣資訊
const getWeatherDetails = async (lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&lang=zh_tw&units=metric`;

  try {
    const response = await fetch(WEATHER_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    const data = await response.json();

    const recordedDates = [];
    const fiveDaysForecast = [];
    // 取得當天與未來五天的預測
    data.list.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (!recordedDates.includes(forecastDate)) {
        recordedDates.push(forecastDate);
        fiveDaysForecast.push(forecast);
      }
    });
    console.log(fiveDaysForecast);

    // 清空確保下次使用
    cityInput.value = "";
    weatherCards.innerHTML = "";

    // 渲染至畫面
    fiveDaysForecast.forEach((weatherItem) => {
      weatherCards.insertAdjacentHTML(
        "beforeend",
        createWeatherCard(weatherItem)
      );
    });
  } catch (err) {
    console.error(err);
  }
};

// 獲取城市經緯度
const getCityCordinates = async () => {
  // 取得使用者輸入城市
  const userInputCity = cityInput.value.trim();
  // 避免空值
  if (!userInputCity) return;

  // 根據字典查找對應的英文名字
  let cityNameInEnglish = cityDictionary[userInputCity] || userInputCity;

  const GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityNameInEnglish}&appid=${OPENWEATHER_API_KEY}&lang=zh_tw`;

  try {
    const response = await fetch(GEOCODING_API_URL);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }

    // 取得緯度
    const lat = data.coord.lat;
    // 取得經度
    const lon = data.coord.lon;

    getWeatherDetails(lat, lon);
  } catch (err) {
    console.error(err);
  }
};

searchBtn.addEventListener("click", getCityCordinates);
