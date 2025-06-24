import {Button as ShadCNButton, ButtonProps as ShadCNButtonProps} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {ReactNode, forwardRef} from "react";
import {usePermission} from "@/hooks/drone";

// 基础增强按钮 props
interface EnhancedButtonProps extends ShadCNButtonProps {
  /** 左侧图标 */
  leftIcon?: ReactNode;
  /** 右侧图标 */
  rightIcon?: ReactNode;
  /** 加载状态 */
  isLoading?: boolean;
  /** 加载时显示的文本 */
  loadingText?: string;
}

// 权限按钮 props
export interface PermissionButtonProps extends EnhancedButtonProps {
  /** 权限键值 */
  permissionKey?: string;
}

// 基础增强按钮 (不包含权限控制)
const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      leftIcon,
      rightIcon,
      isLoading,
      loadingText,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <ShadCNButton
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </ShadCNButton>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

// 带权限控制的按钮
const Button = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({permissionKey, ...props}, ref) => {
    const {hasPermission} = usePermission();

    // 如果没有提供 permissionKey 或没有权限控制需求，直接渲染增强按钮
    if (!permissionKey) {
      return <EnhancedButton ref={ref} {...props} />;
    }

    // 检查权限
    if (!hasPermission(permissionKey)) return null;

    return <EnhancedButton ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export {Button};
