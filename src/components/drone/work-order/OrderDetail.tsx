import {WorkOrder} from "@/hooks/drone";
import {Label} from "@/components/ui/label.tsx";
import {ReactNode} from "react";
import {eventMap, warnLevelMap} from "@/components/drone/work-order/order-eventmap.ts";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import {CommonButton} from "@/components/drone/public/CommonButton.tsx";
import {getMediaType} from "@/hooks/drone/order";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";

interface Props {
  currentOrder?: WorkOrder;
}

interface DetailItemProps {
  labelName: string;
  children: ReactNode;
}

const DetailItem = ({labelName, children}: DetailItemProps) => {
  return (
    <div
      style={{
        boxShadow: "inset 0px 0px 12px 0px rgba(45,101,171,0.5)"
      }}
      className={"h-[36px] rounded-[2px] grid grid-cols-3 bg-[#395C95] items-center border-[1px] border-[#2D5FAC]/[.85]"}>
      <Label className={"col-span-1 h-full content-center"}>{labelName}</Label>
      <div className={"col-span-2 bg-[#14294A]/[.8] h-full flex items-center px-4"}>
        {children}
      </div>
    </div>
  );
};

const OrderDetail = ({currentOrder}: Props) => {
  if (!currentOrder) return <div>未查询到工单</div>;

  const {name, order_type, contact, contact_phone, found_time, warning_level, operator_name, pic_list} = currentOrder;

  return (
    <div className={"bg-[#223B6F]/[.5] rounded grid grid-cols-2 py-[22px] px-[17px] gap-x-8 gap-y-2"}>
      <DetailItem labelName="事件名称：">
        <span className={"truncate"} title={name}>{name}</span>
      </DetailItem>
      <DetailItem labelName="事件类型：">
        <span className={"truncate"} title={eventMap[order_type]}>{eventMap[order_type]}</span>
      </DetailItem>
      <DetailItem labelName="联系人：">
        <span className={"truncate"} title={contact}>{contact}</span>
      </DetailItem>
      <DetailItem labelName="联系电话：">
        <span className={"truncate"} title={contact_phone}>{contact_phone}</span>
      </DetailItem>
      <DetailItem labelName="发现时间：">
        <span className={"truncate"} title={found_time}>{found_time}</span>
      </DetailItem>
      <DetailItem labelName="告警等级：">
        <span className={"truncate"} title={warnLevelMap[warning_level]}>{warnLevelMap[warning_level]}</span>
      </DetailItem>
      <DetailItem labelName="处理人：">
        <span className={"truncate"} title={operator_name}>{operator_name}</span>
      </DetailItem>
      <DetailItem labelName="事件文件：">
        <ScrollArea>
          <div className={"space-x-2 flex overflow-auto"}>
            {pic_list.map(url => getMediaType(url) === "image" ? <MediaPreview
                  src={url}
                  type="image"
                  alt="Image Preview"
                  modalWidth="1000px"
                  modalHeight="800px"
                  triggerElement={
                    <CommonButton className={"px-1 text-[#2BE7FF] bg-transparent"} variant={"link"}>图片</CommonButton>
                  }
                /> :
                <MediaPreview
                  src={url}
                  type="video"
                  alt="Video Preview"
                  modalWidth="70vw"
                  modalHeight="70vh"
                  triggerElement={
                    <CommonButton className={"px-1 text-[#2BE7FF] bg-transparent"}
                                  variant={"link"}>视频</CommonButton>
                  }
                />
            )}
          </div>
          <ScrollBar orientation="horizontal" className={"h-[6px]"}/>
        </ScrollArea>
      </DetailItem>
    </div>
  );
};

export default OrderDetail;
