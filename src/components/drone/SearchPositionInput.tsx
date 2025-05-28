import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState, useRef} from "react";
import {useAjax} from "@/lib/http.ts";
import {useDebouncedValue} from "@/hooks/public/utils.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Search, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils";

const MAP_API_PREFIX = "/map/api/v1";

interface SearchResult {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
}

const SearchPositionInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 500);
  const {get} = useAjax();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isComposing || !debouncedValue) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    get(`${MAP_API_PREFIX}/workspaces/geocoding`, {
      query: debouncedValue,
      region: "上海",
      city_limit: false
    }).then((res: any) => {
      const results = res.data.data || [];
      setSearchResults(results);
      setOpen(results.length > 0);
      if (results.length > 0 && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    });
  }, [debouncedValue, isComposing]);

  const handleClear = () => {
    setValue("");
    setSearchResults([]);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onSelectItem = (result: SearchResult) => {
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(result.location.lng, result.location.lat, 500),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
    setValue(result.name);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input
            ref={inputRef}
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className="pl-8 pr-8 text-black"
            placeholder="搜索位置..."
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-muted-foreground"/>
            </Button>
          )}
        </div>
      </PopoverTrigger>
      {searchResults.length > 0 && <PopoverContent className="w-[300px] p-0" align="start" sideOffset={5}>
        <div className="max-h-[300px] overflow-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className={cn(
                "flex cursor-pointer flex-col gap-1 p-3 text-sm",
                "hover:bg-accent",
                index !== searchResults.length - 1 && "border-b"
              )}
              onClick={() => onSelectItem(result)}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-muted-foreground">{result.address}</div>
            </div>
          ))}
        </div>
      </PopoverContent>}
    </Popover>
  );
};

export default SearchPositionInput;
