import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {ReactNode} from "react";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {cn} from "@/lib/utils.ts";

interface CommonDialogProps {
  /** 对话框标题 */
  title: string;
  /** 对话框触发元素 */
  trigger?: ReactNode;
  /** 对话框内容 */
  children: ReactNode;
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
  titleClassname?: string;
  childrenClassname?: string;
  autoTrigger?: boolean;
}

const CommonDialog = ({
                        title,
                        trigger,
                        children,
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
                        titleClassname = "",
                        childrenClassname = "",
                        autoTrigger = true
                      }: CommonDialogProps) => {
  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {autoTrigger ? <DialogTrigger asChild>
        {trigger}
      </DialogTrigger> : trigger}
      <DialogContent
        className={cn("bg-transparent bg-gradient-to-b from-[#203152]/[.78] to-[#1A2337]/[.78] p-0 " +
          "text-white sm:rounded-none border-none text-sm", contentClassName)}>
        <DialogHeader
          style={{
            backgroundSize: "100% 100%"
          }}
          className={"h-[45px] bg-dialog-title flex justify-center pl-8"}>
          <DialogTitle className={cn("text-sm font-medium", titleClassname)}>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("px-8 py-4", childrenClassname)}>
          {children}
        </div>
        <DialogFooter className={cn("pr-4 pb-4")}>
          {customFooter ? (
            customFooter
          ) : (
            <div className={"space-x-4"}>
              {showCancel && (
                <DialogClose asChild>
                  <CommonButton className={"bg-[#53667E]"} onClick={handleCancel}>
                    {cancelText}
                  </CommonButton>
                </DialogClose>
              )}
              {onConfirm &&
                (onOpenChange ? <CommonButton
                      onClick={onConfirm}
                      isLoading={confirmLoading}
                      disabled={confirmDisabled}
                    >
                      {confirmText}
                    </CommonButton>
                    : <DialogClose asChild>
                      <CommonButton
                        onClick={onConfirm}
                        isLoading={confirmLoading}
                        disabled={confirmDisabled}
                      >
                        {confirmText}
                      </CommonButton>
                    </DialogClose>
                )
              }
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommonDialog;
