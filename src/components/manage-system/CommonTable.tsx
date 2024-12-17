import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]

const invoices = [
  {
    index: "1",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
  {
    index: "2",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
  {
    index: "3",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
  {
    index: "4",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
  {
    index: "5",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
  {
    index: "6",
    name: "auicdka",
    createTime: "2024.06.19 15:40:00",
    person: "张三",
    status: "未审核",
  },
]

export function CommonTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={"text-black"}>序号</TableHead>
          <TableHead className={"text-black"}>服务名称</TableHead>
          <TableHead className={"text-black"}>创建时间</TableHead>
          <TableHead className="text-black">创建人</TableHead>
          <TableHead className="text-right text-black">审核状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.index}>
            <TableCell className="font-medium">{invoice.index}</TableCell>
            <TableCell>{invoice.name}</TableCell>
            <TableCell>{invoice.createTime}</TableCell>
            <TableCell>{invoice.person}</TableCell>
            <TableCell className="text-right">{invoice.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
