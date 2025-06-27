import {Forward} from "lucide-react";
import {useState} from "react";
import {toast} from "@/components/ui/use-toast.ts";
import {useAjax} from "@/lib/http.ts";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {CommonSelect} from "@/components/drone/public/CommonSelect.tsx";
import {useCurrentDepartList, useUserListByDepartId} from "@/hooks/drone";

interface Props {
  onOpen?: () => void;
  currentWorkOrderId: number;
  onConfirm?: () => void;
}

const OPERATION_HTTP_PREFIX = "operation/api/v1";

const DistributeDialog = ({onOpen, currentWorkOrderId, onConfirm}: Props) => {
  const [operator, setOperator] = useState<number>(0);
  const {post} = useAjax();
  const {data: departList} = useCurrentDepartList();
  const [departId, setDepartId] = useState<number | undefined>();
  const userList = useUserListByDepartId(departId);

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
    <CommonDialog
      title="工单分配"
      onOpenChange={() => {
        setDepartId(undefined);
        onOpen?.();
      }}
      trigger={
        <PermissionButton
          className={"w-4 h-4 bg-transparent px-0"}
          permissionKey={"Collection_TicketAssign"}
        >
          <Forward/>
        </PermissionButton>
      }
      onConfirm={onDistribute}
    >
      <div className={"space-y-6 py-2 px-4"}>
        <div className={"grid grid-cols-10 items-center gap-4"}>
          <span className={"text-left col-span-2"}>分配部门：</span>
          <CommonSelect
            placeholder={"请选择分配部门"}
            className={"col-span-8"}
            onValueChange={(value) => setDepartId(+value)}
            options={departList?.map(item => ({
              value: item.id.toString(),
              label: item.name
            })) || []}
          />
        </div>
        <div className={"grid grid-cols-10 items-center gap-4"}>
          <span className={"text-left col-span-2"}>分配人员：</span>
          <CommonSelect
            onValueChange={(value) => setOperator(+value)}
            placeholder={"请选择分配人员"}
            className={"col-span-8"}
            options={userList?.map((user) => ({
              value: user.id.toString(),
              label: user.name
            })) || []}
          />
        </div>
      </div>
    </CommonDialog>
  );
};

export default DistributeDialog;

