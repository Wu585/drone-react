import {Card, CardContent} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from "@/components/ui/carousel";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import {useEffect, useState} from "react";
import {useWaylinJobs, useWorkOrderList} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";

interface Props {
  dockSn: string;
}

export function WorkOrderCarousel({dockSn}: Props) {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const {data: currentJobList} = useWaylinJobs(workspaceId, {
    page: 1,
    page_size: 10,
    status: 2,
    dock_sn: dockSn
  });

  const {data: orderList} = useWorkOrderList({
    page: 1,
    page_size: 200,
    tab: 0,
    job: currentJobList?.list[0]?.id || 0
  }, "page");

  // picList 是图片url和order name数组
  const picList: { url: string, name: string }[] = orderList?.list
    .map(order => (order.pic_list || []).map(pic => ({
      url: pic,
      name: order.name || ""
    })))
    .flat() || [];

  // 每两张图片为一组
  const groupSize = 2;
  const groupedPicList: { url: string, name: string }[][] = [];
  for (let i = 0; i < picList.length; i += groupSize) {
    groupedPicList.push(picList.slice(i, i + groupSize));
  }

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
    if (groupedPicList.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (current + 1) % groupedPicList.length;
      api.scrollTo(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [api, current, groupedPicList.length]);

  // 如果orderList为空数组或undefined，显示暂无工单
  if (!orderList || !orderList.list || orderList.list.length === 0) {
    return <div className="h-[268px] flex items-center justify-center text-gray-400 bg-cockpit-workorder" style={{
      backgroundSize: "100% 100%"
    }}>暂无工单</div>;
  }

  return (
    <Carousel className="w-full" setApi={setApi}>
      <CarouselContent>
        {groupedPicList.map((group, groupIdx) => (
          <CarouselItem key={groupIdx}>
            <div className="h-[268px]">
              <Card className={"h-full bg-cockpit-workorder border-none"} style={{
                backgroundSize: "100% 100%"
              }}>
                <CardContent className="py-16 px-6 h-full relative text-white grid grid-cols-2 gap-x-4">
                  {!orderList || !orderList.list || orderList.list.length === 0 ?
                    <div
                      className="h-[268px] flex items-center justify-center text-gray-400">暂无工单</div> : group.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <MediaPreview
                          modalWidth="1000px"
                          modalHeight="800px"
                          src={item.url}
                          type={"image"}
                          triggerElement={
                            <img className={"aspect-square h-[200px] rounded-lg object-cover"} src={item.url}
                                 alt={item.name}/>
                          }
                        />
                        {/*<div className="mt-2 text-white text-base max-w-[180px] truncate" title={item.name}>{item.name}</div>*/}
                      </div>
                    ))}
                  {/* 如果最后一组只有一张，补空位 */}
                  {group.length < groupSize && Array.from({length: groupSize - group.length}).map((_, i) => (
                    <div key={i}></div>
                  ))}
                  <div className={"absolute bottom-[4px] left-1/2 -translate-x-1/2 "}>
                    <div className={"text-white text-lg max-w-[180px] truncate"}
                         title={Array.from(new Set(group.map(item => item.name).filter(Boolean))).join(" / ")}>
                      {Array.from(new Set(group.map(item => item.name).filter(Boolean))).join(" / ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
