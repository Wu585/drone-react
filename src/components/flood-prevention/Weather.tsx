import {getImageUrl} from "@/lib/utils.ts";
import {useWeatherInfo} from "@/hooks/flood-prevention/api.ts";

const weatherMap: any = {
  "多云": "cloudy",
  "阴": "cloudy",
  "晴": "sun",
  "雨": "rain",
  "小雨": "rain",
  "中雨": "rain",
  "大雨": "rain",
};

const Weather = () => {
  const {data} = useWeatherInfo("101021000");

  return (
    <div>
      {data ? <div
        className={"bg-weather w-full h-[100px] flex items-center justify-center mt-4 mb-2 space-x-8"}>
        <img src={getImageUrl(weatherMap[data[0]?.realtime.weather])} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <div className={"relative"}>
            <span className={"text-[36px] font-bold"}>
              {data[0]?.realtime.temp}
            </span>
            <span className={"absolute top-2"}>°C</span>
          </div>
          <div className={"space-x-2"}>
            <span>{data[0]?.realtime.weather}</span>
            <span>{data[0]?.realtime.wD}</span>
          </div>
        </div>
        <div className={"flex flex-col"}>
          <span>风速 {data[0]?.realtime.wS}</span>
          <span>湿度 {data[0]?.realtime.sD} %</span>
          <span>空气质量 {data[0]?.pm25.aqi}</span>
        </div>
      </div> : <div className={"bg-weather w-full h-[100px] flex items-center justify-center mt-4 mb-2 space-x-8"}>
        暂无数据
      </div>}
      <div className={"flex items-center justify-center whitespace-nowrap"}>
        {
          data && data[0]?.weatherDetailsInfo.weather3HoursDetailsInfos.map(
            ({endTime, highestTemperature, lowerestTemperature, weather}: any) => <div
              className={"flex flex-col justify-center items-center"}>
              <span> {endTime.split(" ")[1].slice(0, -3)} </span>
              <img className={"h-[64px]"} src={getImageUrl(weatherMap[weather])} alt=""/>
              <span className={"pl-2"}>{lowerestTemperature}/{highestTemperature}℃</span>
            </div>)
        }
      </div>
    </div>
  );
};

export default Weather;

