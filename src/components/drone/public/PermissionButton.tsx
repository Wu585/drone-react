import {useCurrentUser} from "@/hooks/drone";
import {Button} from "@/components/ui/button.tsx";
import {ComponentPropsWithoutRef, forwardRef} from "react";

// 继承原生 button 的所有属性，并添加自定义属性
interface PermissionButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  permissionKey: string;
}

const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({permissionKey, children, ...props}, ref) => {
    const {data: currentUser} = useCurrentUser();
    const permissions = currentUser?.resources.map(item => item.uu_key) || [];

    if (!permissions.includes(permissionKey)) {
      return null;
    }

    return (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    );
  }
);

PermissionButton.displayName = "PermissionButton";

export default PermissionButton;

