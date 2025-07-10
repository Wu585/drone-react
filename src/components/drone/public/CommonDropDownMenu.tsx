import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {ComponentPropsWithoutRef, ReactNode, forwardRef} from "react";
import {usePermission} from "@/hooks/drone";
import {cn} from "@/lib/utils";
import {DropdownMenuProps} from "@radix-ui/react-dropdown-menu";

interface CommonDropDownMenuItemProps extends ComponentPropsWithoutRef<typeof DropdownMenuItem> {
  permissionKey?: string;
  children: ReactNode;
  itemClassName?: string;
}

interface CommonDropDownMenuProps extends DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
}

const CommonDropDownMenuItem = forwardRef<HTMLDivElement, CommonDropDownMenuItemProps>(
  ({permissionKey, children, className, itemClassName, ...props}, ref) => {
    const {hasPermission} = usePermission();

    if (!permissionKey || hasPermission(permissionKey)) {
      return (
        <DropdownMenuItem
          ref={ref}
          className={cn(
            "focus:bg-[#2D5FAC] focus:text-white text-[#d0d0d0] text-xs px-3 py-2",
            "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
            itemClassName,
            className
          )}
          {...props}
        >
          {children}
        </DropdownMenuItem>
      );
    }

    return null;
  }
);

CommonDropDownMenuItem.displayName = "CommonDropDownMenuItem";

const CommonDropDownMenu = forwardRef<HTMLButtonElement, CommonDropDownMenuProps>(
  ({trigger, children, className, contentClassName, triggerClassName, ...props}, ref) => {
    return (
      <DropdownMenu {...props}>
        <DropdownMenuTrigger
          asChild
          ref={ref}
          className={cn(
            "bg-[#1E3762]/[.7] h-8 text-xs",
            "data-[placeholder]:text-[#d0d0d0] rounded-[2px] px-3",
            "focus:outline-none",
            triggerClassName,
            className
          )}
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            "bg-[#1E3762] border-[1px] border-[#2D5FAC]/[.85] p-1 min-w-[120px]",
            "text-xs text-white rounded-[2px] shadow-lg",
            contentClassName
          )}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

CommonDropDownMenu.displayName = "CommonDropDownMenu";

export {CommonDropDownMenu, CommonDropDownMenuItem};
