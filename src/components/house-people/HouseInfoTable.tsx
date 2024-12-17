import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";

interface HouseInfo {
  communityName: string;
  unit: string;
  floor: string;
  roomNumber: string;
  area: string;
  type: string;
}

const HouseInfoTable = () => {
  const dataList: HouseInfo[] = [
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
    {
      communityName: "某某小区",
      unit: "2单元",
      floor: "11F",
      roomNumber: "1102",
      area: "120m²",
      type: "住宅",
    },
  ];

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className={"border-none bg-[#2D63A6]"}>
            <TableHead className="text-center">小区名称</TableHead>
            <TableHead className={"text-center"}>单元</TableHead>
            <TableHead className={"text-center"}>楼层</TableHead>
            <TableHead className={"text-center"}>门牌号</TableHead>
            <TableHead className={"text-center"}>面积</TableHead>
            <TableHead className={"text-center"}>类型</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataList.map((item, index) =>
            <TableRow
              key={index}
              className={cn("border-none cursor-pointer", index % 2 !== 0 ? "bg-[#4281CF] bg-opacity-40" : "bg-[#0F2046]/50")}>
              <TableCell className={"text-center"}>{item.communityName}</TableCell>
              <TableCell className={"text-center"}>{item.unit}</TableCell>
              <TableCell className={"text-center"}>{item.floor}</TableCell>
              <TableCell className={"text-center"}>{item.roomNumber}</TableCell>
              <TableCell className={"text-center"}>{item.area}</TableCell>
              <TableCell className={"text-center"}>{item.type}</TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
};

export default HouseInfoTable;

