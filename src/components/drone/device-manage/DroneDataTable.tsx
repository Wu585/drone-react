import {
  ColumnDef,
  PaginationState,
} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import {Device, useBindingDevice} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {Edit} from "lucide-react";
import {useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {EditDeviceDialog, EditDeviceFormValues} from "./EditDeviceDialog";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";

const HTTP_PREFIX = "/manage/api/v1";

const DroneDataTable = () => {
  const departId = localStorage.getItem("departId");
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const [currentDevice, setCurrentDevice] = useState<Device>();
  const [open, setOpen] = useState(false);
  const {put} = useAjax();

  const handleEdit = (device: Device) => {
    setCurrentDevice(device);
    setOpen(true);
  };

  const handleSubmit = async (values: EditDeviceFormValues) => {
    setOpen(false);
    try {
      await put(`${HTTP_PREFIX}/devices/${workspaceId}/devices/${currentDevice?.device_sn}`, values);
      toast({
        description: "编辑成功"
      });
      await mutate();
    } catch (err: any) {
      toast({
        description: "编辑失败",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<Device>[] = useMemo(() => {
    return [
      {
        accessorKey: "device_name",
        header: "型号",
        size: 100,
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("device_name")}>
            {row.getValue("device_name")}
          </div>
        )
      },
      {
        accessorKey: "device_sn",
        header: "设备SN",
        size: 200,
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("device_sn")}>
            {row.getValue("device_sn")}
          </div>
        )
      },
      {
        accessorKey: "nickname",
        header: "名称",
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("nickname")}>
            {row.getValue("nickname")}
          </div>
        )
      },
      {
        accessorKey: "firmware_version",
        header: "固件版本",
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("firmware_version")}>
            {row.getValue("firmware_version")}
          </div>
        )
      },
      {
        accessorKey: "status",
        header: "状态",
        size: 80,
        cell: ({row}) => (
          <div className="">
          <span className={row.original.status ? "text-green-500" : "text-red-500"}>
            {row.original.status ? "在线" : "离线"}
          </span>
          </div>
        )
      },
      {
        accessorKey: "workspace_name",
        header: "组织",
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("workspace_name")}>
            {row.getValue("workspace_name")}
          </div>
        )
      },
      {
        accessorKey: "bound_time",
        header: "加入组织时间",
        size: 180,
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("bound_time")}>
            {row.getValue("bound_time")}
          </div>
        )
      },
      {
        accessorKey: "login_time",
        header: "最后在线时间",
        size: 180,
        cell: ({row}) => (
          <div className="truncate" title={row.getValue("login_time")}>
            {row.getValue("login_time")}
          </div>
        )
      },
      {
        header: "操作",
        cell: ({row}) => {
          return (
            <div className="">
              <Edit
                size={16}
                className="cursor-pointer hover:text-[#43ABFF] transition-colors"
                onClick={() => handleEdit(row.original)}
              />
            </div>
          );
        }
      },
    ];
  }, []);

  const defaultParams = {
    page: 1,
    page_size: 10,
    domain: EDeviceTypeName.Aircraft,
    organ: departId ? +departId : undefined,
  };

  const [queryParams, setQueryParams] = useState(defaultParams);
  const {data, mutate, isLoading} = useBindingDevice(workspaceId, queryParams);

  // 处理分页变化
  const handlePaginationChange = (pagination: PaginationState) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <EditDeviceDialog
        open={open}
        onOpenChange={setOpen}
        device={currentDevice}
        title="设备编辑"
        label="设备名称："
        placeholder="输入设备名称"
        onSubmit={handleSubmit}
      />

      <div className="flex-1 overflow-hidden">
        <CommonTable
          loading={isLoading}
          data={data?.list || []}
          columns={columns}
          allCounts={data?.list?.length || 0}
          onPaginationChange={handlePaginationChange}
          getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
        />
      </div>


    </div>
  );
};

export default DroneDataTable;

