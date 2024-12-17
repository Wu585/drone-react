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
    paymentStatus: "Paid",
    totalAmount: "测试",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "测试",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "测试",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "测试",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "测试",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "测试",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "测试",
    paymentMethod: "Credit Card",
  },
]

export function BicyclesInfoTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className={'border-none bg-[#4281CF] bg-opacity-40'}>
          <TableHead className="w-[150px]">单车编号</TableHead>
          <TableHead>单车品牌</TableHead>
          <TableHead>单车所在经度</TableHead>
          <TableHead className={'text-center'}>单车所在纬度</TableHead>
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
