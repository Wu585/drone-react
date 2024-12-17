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
    invoice: "医疗卫生设施",
    paymentStatus: "10",
    totalAmount: "测试",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "教育设施",
    paymentStatus: "32",
    totalAmount: "测试",
    paymentMethod: "PayPal",
  },
  {
    invoice: "行政管理设施",
    paymentStatus: "33",
    totalAmount: "测试",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "市政公用设施",
    paymentStatus: "21",
    totalAmount: "测试",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "文化体育设施",
    paymentStatus: "12",
    totalAmount: "测试",
    paymentMethod: "PayPal",
  },
]

export function FacilitiesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className={'border-none bg-[#4281CF] bg-opacity-40'}>
          <TableHead className="w-[150px]">设施名称</TableHead>
          <TableHead>数量</TableHead>
          <TableHead>服务类型</TableHead>
          <TableHead className={'text-center'}>服务特色</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow className={cn('border-none', index % 2 !== 0 ? 'bg-[#4281CF] bg-opacity-40' : '')}
                    key={invoice.invoice}>
            <TableCell>{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className={'text-center'}>{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>

    </Table>
  )
}
