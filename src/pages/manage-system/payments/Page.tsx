import {columns, Payment} from "@/pages/manage-system/payments/Column.tsx";
import {DataTable} from "@/pages/manage-system/payments/DateTable.tsx";


export default function DemoPage() {
  const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52d",
      amount: 200,
      status: "pending",
      email: "xm@example.com",
    },
    // ...
  ];

  return (
    <div className="w-full">
      <DataTable columns={columns} data={data}/>
    </div>
  );
}
