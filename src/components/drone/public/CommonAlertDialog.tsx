import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {ReactNode} from "react";
import {CommonButton} from "@/components/drone/public/CommonButton";
import {cn} from "@/lib/utils";

interface CommonAlertDialogProps {
  /** 对话框标题 */
  title: string;
  /** 对话框描述内容 */
  description?: ReactNode;
  /** 对话框触发元素 */
  trigger: ReactNode;
  /** 确认按钮文本，默认为"确认" */
  confirmText?: string;
  /** 取消按钮文本，默认为"取消" */
  cancelText?: string;
  /** 确认按钮点击事件 */
  onConfirm?: () => void;
  /** 取消按钮点击事件 */
  onCancel?: () => void;
  /** 是否显示取消按钮，默认为true */
  showCancel?: boolean;
  /** 自定义底部内容，如果提供则覆盖默认的底部按钮 */
  customFooter?: ReactNode;
  /** 对话框打开状态（受控模式） */
  open?: boolean;
  /** 对话框打开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 确认按钮加载状态 */
  confirmLoading?: boolean;
  /** 确认按钮是否禁用 */
  confirmDisabled?: boolean;
  /** 对话框内容类名 */
  contentClassName?: string;
  /** 是否显示描述内容，默认为true */
  showDescription?: boolean;
}

const CommonAlertDialog = ({
                             title,
                             description,
                             trigger,
                             confirmText = "确认",
                             cancelText = "取消",
                             onConfirm,
                             onCancel,
                             showCancel = true,
                             customFooter,
                             open,
                             onOpenChange,
                             confirmLoading = false,
                             confirmDisabled = false,
                             contentClassName = "",
                             showDescription = true,
                           }: CommonAlertDialogProps) => {
  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent
        style={{
          boxShadow: "0px 2px 18px 0px rgba(3,25,57,0.5)",
        }}
        className={cn(
          "bg-transparent bg-gradient-to-b from-[#41679D]/[.95] to-[#2F4972]/[.95] py-8 " +
          "rounded-lg border-none content-center flex-col",
          contentClassName
        )}
      >
        <AlertDialogHeader className={""}>
          <AlertDialogTitle className={"text-lg font-semibold text-white"}>
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {showDescription && (
          <AlertDialogDescription className="text-white content-center w-full pb-8">
            {description}
          </AlertDialogDescription>
        )}

        <AlertDialogFooter>
          {customFooter ? (
            customFooter
          ) : (
            <div className={"space-x-4"}>
              {showCancel && (
                <AlertDialogCancel asChild>
                  <CommonButton
                    className={"border-none bg-[#53667E] hover:bg-[#53667E] hover:text-white px-5 h-8"}
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </CommonButton>
                </AlertDialogCancel>
              )}
              {onConfirm && (
                <AlertDialogAction asChild>
                  <CommonButton
                    className={"bg-[#3084E4] px-5 h-8"}
                    onClick={onConfirm}
                    isLoading={confirmLoading}
                    disabled={confirmDisabled}
                  >
                    {confirmText}
                  </CommonButton>
                </AlertDialogAction>
              )}
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CommonAlertDialog;
