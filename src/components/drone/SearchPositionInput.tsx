import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
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

  useEffect(() => {
    if (!debouncedValue) {
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
      console.log('results');
      console.log(results);
      setSearchResults(results);
      setOpen(results.length > 0);
    });
  }, [debouncedValue]);

  const handleClear = () => {
    setValue("");
    setSearchResults([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
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
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start" sideOffset={5}>
        <div className="max-h-[300px] overflow-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className={cn(
                "flex cursor-pointer flex-col gap-1 p-3 text-sm",
                "hover:bg-accent",
                index !== searchResults.length - 1 && "border-b"
              )}
              onClick={() => {
                // Handle result selection here
                setValue(result.name);
                setOpen(false);
              }}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-muted-foreground">{result.address}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchPositionInput;

