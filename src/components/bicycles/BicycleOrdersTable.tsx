import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {BicycleOrder} from "@/hooks/bicycles/api.ts";
import {FC} from "react";
import {useBicycleStore} from "@/store/useBicycleStore.ts";

const BicycleOrdersTable: FC<{
  amount: number
  onCheckOrderInfo?: (orderId: string) => void
  orderList?: BicycleOrder[]
}> = ({onCheckOrderInfo, orderList}) => {
  const {setSelectedOrder} = useBicycleStore()

  const onSelectOrder = (order: BicycleOrder) => {
    setSelectedOrder(order)
    onCheckOrderInfo?.(order.orderId)
  }

  return (
    <div className={'w-[500px] h-[400px] flex flex-col justify-between'}>
      {
        orderList && orderList.length > 0 ?
          <Table>
            <TableHeader>
              <TableRow className={'border-none bg-[#2D63A6] whitespace-nowrap'}>
                <TableHead className={"w-[100px]"}>订单编号</TableHead>
                <TableHead className={"w-[80px]"}>借车时间</TableHead>
                <TableHead>还车时间</TableHead>
                <TableHead className={'text-center'}>是否正常还车</TableHead>
                <TableHead className={'text-center'}>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={"max-h-[200px] whitespace-nowrap"}>
              {orderList?.map((order, index) => (
                <TableRow
                  className={cn('border-none', index % 2 !== 0 ? 'bg-[#4281CF] bg-opacity-40' : 'bg-[#0F2046]/50')}
                  key={index}>
                  {/*<TableCell className={"overflow-ellipsis"}>{order.orderId}</TableCell>*/}
                  <TableCell>
                    <div className={"w-[48px] overflow-hidden overflow-ellipsis whitespace-nowrap"}>
                      {order.orderId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={"w-[80px] whitespace-pre-wrap"}>
                      {order.startTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={"w-[80px] whitespace-pre-wrap"}>
                      {order.endTime}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn('text-center', order.returnNormal === 0 ? 'text-[#ff2020]' : 'text-[#21d45a]')}>{order.returnNormal === 0 ? '否' : '是'}</TableCell>
                  <TableCell className={'text-center cursor-pointer'} onClick={() => onSelectOrder(order)}>
                    <span>查看</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          : <div className={'h-[250px] bg-[#0F2046]/50 flex justify-center items-center'}>暂无数据</div>
      }
      {/*<div className={"bg-[#0F2046]/50 flex justify-center items-center py-[8px]"}>
        <span className={'cursor-pointer'} onClick={() => onLastPage()}>{'<<'}</span>
        <span className={'px-[6px]'}>{page}</span>
        <span className={'cursor-pointer'} onClick={() => onNextPage()}>{'>>'}</span>
        <span className={'px-[32px]'}>
            {page} / {Math.ceil(amount / 6)}
          </span>
      </div>*/}
    </div>
  );
}

export default BicycleOrdersTable

