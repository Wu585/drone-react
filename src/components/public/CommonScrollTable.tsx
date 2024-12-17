import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  {
    id: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    id: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    id: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV008",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    id: "INV009",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV010",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV011",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    id: "INV012",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV013",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

const CommonScrollTable = () => {
  return (
    <div className={"w-full flex flex-col justify-between"}>
      <Table className="w-full border">
        <TableHeader>
          <TableRow className="relative border-none bg-[#0076B0]/[.4] table table-fixed">
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <div style={{
              border: "1px solid",
              height: "1px",
              borderImage: "linear-gradient(270deg, rgba(51, 218, 252, 0), rgba(51, 218, 252, 1), rgba(51, 218, 252, 0)) 1 1"
            }} className={"absolute bottom-0 left-0 w-full"}/>
          </TableRow>
        </TableHeader>

        <TableBody className=" block overflow-y-auto" style={{height: 400}}>

          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className=" table table-fixed">
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell className="w-[100px]">{invoice.paymentStatus}</TableCell>
              <TableCell className="w-[100px]">{invoice.paymentMethod}</TableCell>
              <TableCell className=" w-[100px] text-right">{invoice.totalAmount}</TableCell>
            </TableRow>
          ))}

        </TableBody>

      </Table>
    </div>
  );
};

export default CommonScrollTable;
