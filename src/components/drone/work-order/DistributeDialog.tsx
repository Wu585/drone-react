import {Forward} from "lucide-react";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {useState} from "react";
import {useCurrentDepartList, useUserListByDepartId} from "@/hooks/drone/organ";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";

interface Props {
  onOpen?: () => void;
  currentWorkOrderId: number;
  onConfirm?: () => void;
}

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const DistributeDialog = ({onOpen, currentWorkOrderId, onConfirm}: Props) => {
  const [operator, setOperator] = useState<number>(0);
  const {post} = useAjax();
  const departList = useCurrentDepartList();
  const {setDepartId, userList} = useUserListByDepartId();

  const onDistribute = async () => {
    try {
      if (operator && currentWorkOrderId) {
        const res: any = await post(`${OPERATION_HTTP_PREFIX}/order/deliver`, {
          id: currentWorkOrderId,
          operator
        });
        if (res.data.code === 0) {
          toast({
            description: "工单分配成功！"
          });
          onConfirm?.();
        }
      }
    } catch (err: any) {
      toast({
        description: err.data.message(),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Forward className={"w-4 cursor-pointer"} onClick={onOpen}/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>工单分配</DialogTitle>
        </DialogHeader>
        <div className={"space-y-4"}>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"text-right"}>分配部门</span>
            <Select onValueChange={(value) => {
              setDepartId(+value);
            }}>
              <SelectTrigger className={"col-span-3"}>
                <SelectValue placeholder="选择分配部门"/>
              </SelectTrigger>
              <SelectContent>
                {departList?.map(item =>
                  <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"text-right"}>分配人员</span>
            <Select onValueChange={(value) => setOperator(+value)}>
              <SelectTrigger className={"col-span-3"}>
                <SelectValue placeholder="选择人员"/>
              </SelectTrigger>
              <SelectContent>
                {userList.map(user =>
                  <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button className={"bg-[#43ABFF] w-24"} onClick={onDistribute}>确认</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
};

export default DistributeDialog;

