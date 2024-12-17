import {useEffect, useState} from "react";
import dayjs from "dayjs";

export const getDate = () => dayjs().format("YYYY.MM.DD");

export const getWeekDay = () => {
  const weekDayList = ['日', '一', '二', '三', '四', '五', '六'];
  return "星期" + weekDayList[dayjs().day()];
};

export const getTime = () => dayjs().format("HH:mm:ss");

export const useDateTime = () => {
  const [date, setDate] = useState(getDate());
  const [weekDay, setWeekDay] = useState(getWeekDay());
  const [time, setTime] = useState(getTime());

  useEffect(() => {
    setDate(getDate());
    setWeekDay(getWeekDay());
    setTime(getTime());
    const interval = setInterval(() => {
      setTime(getTime());

      // 检查是否需要更新日期和星期
      const currentDate = getDate();
      if (currentDate !== date) {
        setDate(currentDate);
        setWeekDay(getWeekDay());
      }

    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {date, weekDay, time};
};
