import {Button} from "@/components/drone/public/Button";
import {forwardRef} from "react";
import {CommonButtonProps} from "@/components/drone/public/CommonButton.tsx";

interface IconButtonProps extends CommonButtonProps {
  // 可以添加CommonButton特有的props
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({className, variant = "default", ...props}, ref) => {
    return (
      <Button
        className={`bg-transparent rounded text-white p-0 h-6 ${className}`}
        ref={ref}
        {...props}
        variant={variant}
      />
    );
  }
);

IconButton.displayName = "CommonButton";

export {IconButton};
