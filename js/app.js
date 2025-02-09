import { OPENWEATHER_API_KEY } from "./config.js";
import { cityDictionary } from "./cityMapper.js";

const cityInput = document.querySelector(".weather-input input");
const currentWeather = document.querySelector(".current-weather");
const weatherCards = document.querySelector(".weather-cards");
const searchBtn = document.querySelector(".search-btn");

// 渲染當前的天氣資訊
const createCurrentWeather = (currentItem, cityNameInChinese) => {
  return `
    <div class="details">
      <h2>${cityNameInChinese}<br />${currentItem.dt_txt.split(" ")[0]}</h2>
      <h4>溫度<br />${currentItem.main.temp} °C</h4>
      <h4>風速<br />${currentItem.wind.speed} M/S</h4>
      <h4>濕度<br />${currentItem.main.humidity} %</h4>
    </div
    <div class="icon"> 
      <img
        src="https:/openweathermap.org/img/wn/${
          currentItem.weather[0].icon
        }@2x.png"
        alt="weather-icon"
      />
      <h4>降雨量中等</h4>
    </div>
  `;
};

// 渲染未來五天的天氣資訊
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
      <h4>溫度: ${weatherItem.main.temp} °C</h4>
      <h4>風速: ${weatherItem.wind.speed} M/S</h4>
      <h4>濕度: ${weatherItem.main.humidity} %</h4>
    </li>
  `;
};

// 取得天氣資訊
const getWeatherDetails = async (cityNameInChinese, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&lang=zh_tw&units=metric`;

  try {
    const response = await fetch(WEATHER_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.city.name);

    const recordedDates = [];
    const sixDayForecast = [];
    // 取得當天與未來五天的預測
    data.list.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (!recordedDates.includes(forecastDate)) {
        recordedDates.push(forecastDate);
        sixDayForecast.push(forecast);
      }
    });

    // 清空確保下次使用
    cityInput.value = "";
    weatherCards.innerHTML = "";
    currentWeather.innerHTML = "";

    // 取得未來五天 天氣資訊象
    let fiveDayForecast = sixDayForecast.slice(1, 6);
    // 渲染未來五天 天氣資訊至畫面
    fiveDayForecast.forEach((weatherItem) => {
      weatherCards.insertAdjacentHTML(
        "beforeend",
        createWeatherCard(weatherItem)
      );
    });

    // 取得當天天氣資訊
    let todayForecast = sixDayForecast.slice(0, 1);
    // 渲染當天天氣資訊至畫面
    todayForecast.forEach((currentItem) => {
      currentWeather.insertAdjacentHTML(
        "beforeend",
        createCurrentWeather(currentItem, cityNameInChinese)
      );
    });
  } catch (err) {
    console.error(err);
  }
};

// 反向對應城市名稱 (英文 > 中文)
// Object.entries() 把物件轉換為陣列 每個鍵值對變成一個 [key, value] 的小陣列
// Object.fromEntries() 把「二維陣列」轉回物件 (與 Object.entries() 相反)
const reverseCityDictionar = Object.fromEntries(
  Object.entries(cityDictionary).map(([chinese, english]) => [english, chinese])
);

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

    const apiCityName = data.name;

    const cityNameInChinese = reverseCityDictionar[apiCityName] || apiCityName;

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }

    // 取得緯度
    const lat = data.coord.lat;
    // 取得經度
    const lon = data.coord.lon;

    getWeatherDetails(cityNameInChinese, lat, lon);
  } catch (err) {
    console.error(err);
  }
};

searchBtn.addEventListener("click", getCityCordinates);
