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
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
}

const CommonSelect = forwardRef<HTMLButtonElement, CommonSelectProps>(
  ({options, placeholder = "请选择...", className, contentClassName, ...props}, ref) => {
    return (
      <Select {...props}>
        <SelectTrigger
          ref={ref}
          className={cn(
            "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] h-8 text-xs data-[placeholder]:text-[#d0d0d0] rounded-[2px] justify-between",
            className
          )}
        >
          <SelectValue placeholder={placeholder}/>
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-[#1E3762] border-[1px] border-[#2D5FAC]/[.85] text-xs text-white",
            contentClassName
          )}
        >
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-[#2D5FAC]/[.3] focus:bg-[#2D5FAC]/[.5] focus:text-white"
            >
              {option.label}
            </SelectItem>
          )) || []}
        </SelectContent>
      </Select>
    );
  }
);

CommonSelect.displayName = "CommonSelect";

export {CommonSelect};
