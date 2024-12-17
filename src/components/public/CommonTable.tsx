import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {ReactElement} from "react";

// 定义单元格数据的接口
interface CellData<T> {
  key: string;
  render: (item: T) => ReactElement;
}

// 定义表格属性的接口
interface TableProps<T extends Record<string, any>> {
  data: T[];
  columns: CellData<T>[];
}

function CommonTable<T extends Record<string, any>>({data, columns}: TableProps<T>) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#2D63A6]">
            {columns.map(column => (
              <TableHead key={column.key} className="text-center">
                {column.key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}
                      className={cn("border-none cursor-pointer", index % 2 !== 0 ? "bg-[#4281CF] bg-opacity-40" : "bg-[#0F2046]/50")}>
              {columns.map(column => (
                <TableCell key={column.key} className="text-center whitespace-nowrap">
                  {column.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CommonTable

