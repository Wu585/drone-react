import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import {useAjax} from "@/lib/http.ts";
import {useDebouncedValue} from "@/hooks/public/utils.ts";

const MAP_API_PREFIX = "/map/api/v1";

const SearchPositionInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 300);
  const {get} = useAjax();

  useEffect(() => {
    if (!debouncedValue) return;
    console.log(111);
  }, [debouncedValue]);

  return (
    <Input value={value} onChange={e => setValue(e.target.value)} className={"text-black"}/>
  );
};

export default SearchPositionInput;

