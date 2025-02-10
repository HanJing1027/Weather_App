import { OPENWEATHER_API_KEY } from "./config.js";
import { cityDictionary } from "./cityMapper.js";

const cityInput = document.querySelector(".weather-input input");
const currentWeather = document.querySelector(".current-weather");
const weatherCards = document.querySelector(".weather-cards");
const weatherTips = document.querySelector(".weather-tip");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");

// 渲染當前的天氣資訊
const createCurrentWeather = (currentItem, cityNameInChinese) => {
  return `
    <div class="details">
      <h2>${cityNameInChinese}<br />${currentItem.dt_txt.split(" ")[0]}</h2>
      <h4>溫度<br />${currentItem.main.temp} °C</h4>
      <h4>風速<br />${currentItem.wind.speed} M/S</h4>
      <h4>濕度<br />${currentItem.main.humidity} %</h4>
    </div>
    <div class="icon">
      <img
        src="https:/openweathermap.org/img/wn/${
          currentItem.weather[0].icon
        }@2x.png"
        alt="weather-icon"
      />
      <h4>${currentItem.weather[0].description}</h4>
    </div>
  `;
};

// 天氣小貼士
const createWeatherTips = (currentItem) => {
  let tip = "";
  const weatherMain = currentItem.weather[0].main;

  switch (weatherMain) {
    case "Clear":
      tip = "今天天氣晴朗，適合外出走走，但要記得防曬唷！";
      break;
    case "Clouds":
      tip = "雖然沒有太陽，但天氣可能悶熱或轉變！";
      break;
    case "Rain":
      tip = "小心路滑，記得帶傘！";
      break;
    case "Drizzle":
      tip = "細雨綿綿，可能不太明顯，但還是帶把傘吧！";
      break;
    case "Thunderstorm":
      tip = "雷聲隆隆，請盡量待在室內！";
      break;
    case "Snow":
      tip = "雪花飄飄，請注意保暖！";
      break;
    case "Mist":
      tip = "霧氣瀰漫，視線不清，請小心！";
      break;
    case "Haze":
      tip = "空氣品質不佳，建議減少外出！";
      break;
    case "Smoke":
      tip = "空氣中瀰漫煙霧，請保護呼吸道！";
      break;
    case "Fog":
      tip = "濃霧瀰漫，能見度低，請注意安全！";
      break;
    case "Dust":
      tip = "風沙大，請做好防護！";
      break;
    case "Sand":
      tip = "沙塵滾滾，盡量待在室內！";
      break;
    case "Ash":
      tip = "火山灰影響空氣品質，請注意防護！";
      break;
    case "Squall":
      tip = "狂風吹襲，請遠離不穩固物品！";
      break;
    case "Tornado":
      tip = "龍捲風警報，請盡速尋找掩蔽處！";
      break;
  }

  return `
    <div class="tip-header">
      <img
        src="https://openweathermap.org/img/wn/${currentItem.weather[0].icon}@2x.png"
        alt="weather-icon"
      />
      <h2>天氣小貼士</h2>
    </div>
    <p>「${tip}」</p>
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
    weatherTips.innerHTML = "";

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
    console.log(todayForecast);
    // 渲染當天天氣資訊至畫面
    todayForecast.forEach((currentItem) => {
      currentWeather.insertAdjacentHTML(
        "beforeend",
        createCurrentWeather(currentItem, cityNameInChinese)
      );

      weatherTips.insertAdjacentHTML(
        "beforeend",
        createWeatherTips(currentItem)
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

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }

    const data = await response.json();

    const apiCityName = data.name;

    const cityNameInChinese = reverseCityDictionar[apiCityName] || apiCityName;

    // 取得緯度
    const lat = data.coord.lat;
    // 取得經度
    const lon = data.coord.lon;

    getWeatherDetails(cityNameInChinese, lat, lon);
  } catch (err) {
    console.error(err);
  }
};

// 取得使用者當前經緯度的天氣資訊
const getWeatherByLocation = async () => {
  // 使用瀏覽器Geolocation API來取得使用者的經緯度
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      // 取得當前經緯度
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      // 使用定位的經緯度進行反向地理編碼，獲取城市名稱
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}&lang=zh_tw`;

      try {
        const response = await fetch(REVERSE_GEOCODING_URL);

        if (!response.ok) {
          throw new Error(`反向地理編碼錯誤！狀態碼: ${response.status}`);
        }

        const data = await response.json();

        // 獲取城市名字
        const apiCityName = data[0].name;
        const cityNameInChinese = reverseCityDictionar[apiCityName];

        getWeatherDetails(cityNameInChinese, lat, lon);
      } catch (err) {
        console.error(err);
      }
    },
    (error) => {
      console.error(`獲取位置失敗 ${error}`);
    }
  );
};

searchBtn.addEventListener("click", getCityCordinates);
locationBtn.addEventListener("click", getWeatherByLocation);
getWeatherByLocation();
