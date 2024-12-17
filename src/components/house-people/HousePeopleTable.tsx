import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";

interface PeopleInfo {
  name: string;
  gender: string;
  community: string;
  unit: string;
  floor: string;
  roomNumber: string;
  age: number;
}

const HousePeopleTable = () => {
  const dataList: PeopleInfo[] = [
    {
      name: "张三",
      gender: "男",
      community: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      age: 32,
    },
    {
      name: "李四",
      gender: "女",
      community: "某某小区",
      unit: "3单元",
      floor: "13F",
      roomNumber: "1302",
      age: 32,
    }
  ];

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className={"border-none bg-[#2D63A6]"}>
            <TableHead className="text-center">姓名</TableHead>
            <TableHead className={"text-center"}>性别</TableHead>
            <TableHead className={"text-center"}>小区名称</TableHead>
            <TableHead className={"text-center"}>单元</TableHead>
            <TableHead className={"text-center"}>楼层</TableHead>
            <TableHead className={"text-center"}>门牌号</TableHead>
            <TableHead className={"text-center"}>年龄</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataList.map((item, index) =>
            <TableRow
              key={item.name}
              className={cn("border-none cursor-pointer", index % 2 !== 0 ? "bg-[#4281CF] bg-opacity-40" : "bg-[#0F2046]/50")}>
              <TableCell className={"text-center"}>{item.name}</TableCell>
              <TableCell className={"text-center"}>{item.gender}</TableCell>
              <TableCell className={"text-center"}>{item.community}</TableCell>
              <TableCell className={"text-center"}>{item.unit}</TableCell>
              <TableCell className={"text-center"}>{item.floor}</TableCell>
              <TableCell className={"text-center"}>{item.roomNumber}</TableCell>
              <TableCell className={"text-center"}>{item.age}</TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
};

export default HousePeopleTable;

