import {ColumnDef} from "@tanstack/react-table";
import {useMemo, useState} from "react";
import {ChildDevice, Device, useBindingDevice} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {EDeviceTypeName} from "@/hooks/drone/device.ts";
import {BookImage, Edit, SquareGanttChart} from "lucide-react";
import {getAuthToken, useAjax} from "@/lib/http.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {EditDeviceDialog, EditDeviceFormValues} from "./EditDeviceDialog";
import InsuranceSheet from "@/components/drone/device-manage/InsuranceSheet.tsx";
import MaintainanceSheet from "@/components/drone/device-manage/Maintainance.tsx";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import Uploady from "@rpldy/uploady";
import {CommonTable} from "@/components/drone/public/CommonTable.tsx";
import {Icon} from "@/components/public/Icon.tsx";

const OPERATION_HTTP_PREFIX = "operation/api/v1";

interface TableDevice extends Omit<Device, "children"> {
  children: ChildDevice[];
}

const DockDataTable = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const departId = localStorage.getItem("departId");

  const [currentDock, setCurrentDock] = useState<Device | TableDevice>();
  const [currentDockId, setCurrentDockId] = useState<number>();
  const [open, setOpen] = useState(false);
  const [insuranceSheetVisible, setInsuranceSheetVisible] = useState(false);
  const [maintainanceSheetVisible, setMaintainanceSheetVisible] = useState(false);
  const {put} = useAjax();

  const handleEdit = (device: Device | TableDevice) => {
    setCurrentDock(device as Device);
    setOpen(true);
  };

  const handleSubmit = async (values: EditDeviceFormValues) => {
    setOpen(false);
    try {
      await put(`manage/api/v1/devices/${workspaceId}/devices/${currentDock?.device_sn}`, values);
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

  const columns: ColumnDef<TableDevice>[] = useMemo(() => {
    return [
      {
        accessorKey: "device_name",
        header: "型号",
        cell: ({row}) => (
          <div
            className="truncate flex items-center gap-2"
            style={{paddingLeft: `${row.depth * 2}rem`}}
            title={row.getValue("device_name")}
          >
            {row.getCanExpand() ? (
              <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: {cursor: "pointer"},
                }}
                className="w-4 h-4 flex items-center justify-center"
              >
                {row.getIsExpanded() ? "▼" : "▶"}
              </button>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <Icon name={"topo-line"} className={""}/>
              </div>
            )}
            <span className="truncate">{row.getValue("device_name")}</span>
          </div>
        )
      },
      {
        accessorKey: "device_sn",
        header: "设备SN",
        size: 200,
        cell: ({row}) => (
          <div className=" truncate" title={row.getValue("device_sn")}>
            {row.getValue("device_sn")}
          </div>
        )
      },
      {
        accessorKey: "nickname",
        header: "名称",
        size: 160,
        cell: ({row}) => (
          <div className=" truncate" title={row.getValue("nickname")}>
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
        size: 100,
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
          <div className=" truncate" title={row.getValue("login_time")}>
            {row.getValue("login_time")}
          </div>
        )
      },
      {
        header: "操作",
        cell: ({row}) => {
          return (
            <div className="flex space-x-2 items-center">
              <Edit
                size={16}
                className="cursor-pointer hover:text-[#43ABFF] transition-colors"
                onClick={() => handleEdit(row.original)}
              />
              <SquareGanttChart
                size={16}
                className="cursor-pointer hover:text-[#43ABFF] transition-colors"
                onClick={() => {
                  setInsuranceSheetVisible(true);
                  setCurrentDock(row.original);
                  setCurrentDockId(row.original.id);
                }}
              />
              <BookImage
                size={16}
                className="cursor-pointer hover:text-[#43ABFF] transition-colors"
                onClick={() => {
                  setMaintainanceSheetVisible(true);
                  setCurrentDock(row.original);
                }}
              />
            </div>
          );
        }
      },
    ];
  }, []);

  const initialQueryParams = {
    domain: EDeviceTypeName.Dock,
    organ: departId ? +departId : undefined,
    page: 1,
    page_size: 10,
  };

  const [queryParams, setQueryParams] = useState(initialQueryParams);

  const {data, mutate} = useBindingDevice(workspaceId, queryParams);

  const currentDevice = data?.list.find(item => item.id === currentDockId);

  const renderData = data?.list.map((item) => ({
    ...item,
    children: [item.children],
  })) as TableDevice[];

  return (
    <Uploady
      destination={{
        url: `${CURRENT_CONFIG.baseURL}${OPERATION_HTTP_PREFIX}/file/upload`,
        headers: {
          [ELocalStorageKey.Token]: getAuthToken()
        }
      }}
      accept="pdf/*"
      autoUpload>
      <div className="flex flex-col h-full">
        <EditDeviceDialog
          open={open}
          onOpenChange={setOpen}
          device={currentDock}
          title="机场编辑"
          label="机场名称："
          placeholder="输入机场名称"
          onSubmit={handleSubmit}
        />
        <InsuranceSheet
          device={currentDevice}
          open={insuranceSheetVisible}
          onOpenChange={setInsuranceSheetVisible}
          onSuccess={() => mutate()}
        />
        <MaintainanceSheet device={currentDock} open={maintainanceSheetVisible}
                           onOpenChange={setMaintainanceSheetVisible}/>
        <CommonTable
          data={renderData || []}
          columns={columns}
          allCounts={data?.pagination.total || 0}
          getRowClassName={(_, index) => index % 2 === 1 ? "bg-[#203D67]/70" : ""}
          expandedAll
          onPaginationChange={({pageIndex}) => setQueryParams({
            ...queryParams,
            page: pageIndex + 1
          })}
        />
      </div>
    </Uploady>
  );
};

export default DockDataTable;

