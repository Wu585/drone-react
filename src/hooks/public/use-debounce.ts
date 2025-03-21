// 返回一个debounceValue，这个值会在delay后改变，这样用到它的地方的依赖，也会有这样的效果
import {useEffect, useState} from "react";

export const useDebounce = (value, delay: number = 500) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value), delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return [debounceValue, setDebounceValue];
};

