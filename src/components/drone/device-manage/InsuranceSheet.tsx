import {
  Sheet, SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InsuranceSheet = ({open, onOpenChange}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>保险信息</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              保单号:
            </Label>
            <Input id="name" value="" className="col-span-3"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              有效期:
            </Label>
            <Input id="username" value="" className="col-span-3"/>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InsuranceSheet;

