import {Button, PermissionButtonProps} from "@/components/drone/public/Button";
import {forwardRef} from "react";

interface CommonButtonProps extends PermissionButtonProps {
  // 可以添加CommonButton特有的props
}

const CommonButton = forwardRef<HTMLButtonElement, CommonButtonProps>(
  ({className, variant = "default", ...props}, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        variant={variant}
        className={`bg-[#3084E4] rounded text-white h-8 ${className}`}
      />
    );
  }
);

CommonButton.displayName = "CommonButton";

export {CommonButton};
