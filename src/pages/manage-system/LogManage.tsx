import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useLogs} from "@/hooks/manage-system/api.ts";
import {ColumnDef} from "@tanstack/react-table";
import {Log} from "@/hooks/manage-system/api.ts";
import {DataTable} from "@/pages/manage-system/payments/DateTable.tsx";
import {ArrowUpDown} from "lucide-react";
import {parse} from "date-fns";

const logLevelMap: Record<string, string> = {
  "INFO": "信息",
  "WARN": "警告",
  "ERROR": "错误",
  "DEBUG": "调试",
};

const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "logLevel.name",
    header: "级别",
    cell: ({row}) => <span className={"whitespace-nowrap"}>{logLevelMap[row.original.logLevel.name]}</span>,
    meta: "级别"
  },
  {
    accessorKey: "message",
    header: "摘要",
    meta: "摘要"
  },
  {
    accessorKey: "date",
    meta: "时间",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          时间
          <ArrowUpDown className="ml-2 h-4 w-4"/>
        </Button>
      );
    },
    cell: ({row}) => <span className={"whitespace-nowrap"}>{row.original.date}</span>,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length !== 2) return true; // 如果没有选择日期范围，则不过滤
      const date = parse(row.getValue(columnId), "yyyy-MM-dd HH:mm:ss", new Date());
      return date >= filterValue[0] && date <= filterValue[1];
    }
  },
];

const LogManage = () => {
  const {data} = useLogs();

  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>日志管理</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-full mt-2 py-8 px-10 overflow-auto"}>
        <DataTable columns={columns} data={data || []}/>
      </div>
    </div>
  );
};

export default LogManage;

