import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useEffect, useState, useRef} from "react";
import {Loader2, Search} from "lucide-react";
import axios, {AxiosError, CancelTokenSource} from "axios";
import {Button} from "@/components/ui/button";

interface RemoteSearchInputProps<T> {
  placeholder?: string;
  delay?: number;
  onSearch: (query: string, cancelToken: CancelTokenSource) => Promise<T[]>;
  onSelect?: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  emptyText?: string;
  className?: string;
}

export function RemoteSearchInput<T>({
                                       placeholder = "Search...",
                                       delay = 300,
                                       onSearch,
                                       onSelect,
                                       renderItem = (item) => <div>{String(item)}</div>,
                                       emptyText = "No results found",
                                       className,
                                     }: RemoteSearchInputProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  // 防抖效果
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 取消之前的请求
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel();
    }

    const timer = setTimeout(async () => {
      try {
        cancelTokenRef.current = axios.CancelToken.source();
        const data = await onSearch(query, cancelTokenRef.current);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        if (!axios.isCancel(err)) {
          const error = err as AxiosError;
          setError(error.message || "Failed to fetch results");
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel();
      }
    };
  }, [query, delay, onSearch]);

  const handleSelect = (item: T) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"/>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin"/>
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="hidden"></div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          {error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            <div className="max-h-60 overflow-auto">
              {results.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto w-full justify-start whitespace-normal text-left"
                  onClick={() => handleSelect(item)}
                >
                  {renderItem(item)}
                </Button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
