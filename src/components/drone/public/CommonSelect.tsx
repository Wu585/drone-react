import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {forwardRef} from "react";
import {cn} from "@/lib/utils";
import {SelectProps} from "@radix-ui/react-select";

interface CommonSelectProps extends SelectProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const CommonSelect = forwardRef<HTMLButtonElement, CommonSelectProps>(
  ({options, placeholder = "请选择...", ...props}, ref) => {
    return (
      <Select {...props}>
        <SelectTrigger
          ref={ref}
          className={cn(
            "bg-[#182640]/[.7] border-[1px] border-[#2D5FAC]/[.85] rounded h-8 text-xs data-[placeholder]:text-[#d0d0d0]"
          )}
        >
          <SelectValue placeholder={placeholder}  className="placeholder:text-red-500" />
        </SelectTrigger>
        <SelectContent className="bg-[#182640] border-[1px] border-[#2D5FAC]/[.85] text-xs text-white">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-[#2D5FAC]/[.3] focus:bg-[#2D5FAC]/[.5] focus:text-white"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

CommonSelect.displayName = "CommonSelect";

export {CommonSelect};
