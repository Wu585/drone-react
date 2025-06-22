import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import {FC, ReactNode} from "react";

interface CustomPopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
}

const CustomPopover: FC<CustomPopoverProps> = ({
                                                       trigger,
                                                       content,
                                                       className = ""
                                                     }) => {
  return (
    <Popover>
      <PopoverTrigger asChild className={"cursor-pointer"}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className={`bg-[#122B4D] bg-opacity-90 shadow-md shadow-[#031529]/72 rounded-[6px] border-none text-white ${className}`}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
