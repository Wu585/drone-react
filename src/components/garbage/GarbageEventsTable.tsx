import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import {cn} from "@/lib/utils.ts";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站1",
    paymentMethod: "未完成",
  },
  {
    invoice: "INV002",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站1",
    paymentMethod: "完成",
  },
  {
    invoice: "INV003",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站2",
    paymentMethod: "未完成",
  },
  {
    invoice: "INV004",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站1",
    paymentMethod: "完成",
  },
  {
    invoice: "INV005",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站3",
    paymentMethod: "完成",
  },
  {
    invoice: "INV006",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站1",
    paymentMethod: "未完成",
  },
  {
    invoice: "INV007",
    paymentStatus: "2024-02-13",
    totalAmount: "垃圾站2",
    paymentMethod: "完成",
  },
]

export function GarbageEventsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className={'border-none bg-[#4281CF] bg-opacity-40'}>
          <TableHead className="w-[150px]">事件</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>处理厂</TableHead>
          <TableHead className={'text-center'}>处理状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow className={cn('border-none', index % 2 !== 0 ? 'bg-[#4281CF] bg-opacity-40' : '')}
                    key={invoice.invoice}>
            <TableCell>{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.totalAmount}</TableCell>
            <TableCell className={'text-center'}>{invoice.paymentMethod}</TableCell>
          </TableRow>
        ))}
      </TableBody>

    </Table>
  )
}
