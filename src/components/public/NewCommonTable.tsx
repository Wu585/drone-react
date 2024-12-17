import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {ReactElement, ReactNode} from "react";

// 定义单元格数据的接口
interface CellData<T> {
  key: string | ReactNode;
  render: (item: T) => ReactElement;
}

// 定义表格属性的接口
interface TableProps<T extends Record<string, any>> {
  data: T[];
  columns: CellData<T>[];
  height?: number;
}

// sticky top-0 backdrop-blur-sm

function CommonTable<T extends Record<string, any>>({data, columns, height}: TableProps<T>) {
  return (
    <div className={cn("flex flex-col", `h-[${height}px]`)}>
      <Table>
        <TableHeader className={"sticky top-0 backdrop-blur-3xl"}>
          <TableRow className="relative border-none bg-[#0076B0]/[.4]">
            {columns.map((column, index) => (
              <TableHead key={index} className="text-center whitespace-nowrap">
                {typeof column.key === "string" ? column.key : column.key}
              </TableHead>
            ))}
            <div style={{
              border: "1px solid",
              height: "1px",
              borderImage: "linear-gradient(270deg, rgba(51, 218, 252, 0), rgba(51, 218, 252, 1), rgba(51, 218, 252, 0)) 1 1"
            }} className={"absolute bottom-0 left-0 w-full"}/>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index} className={cn("border-none cursor-pointer")}>
                {columns.map((column, index) => (
                  <TableCell key={index} className="text-center whitespace-nowrap">
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-10">
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default CommonTable;

