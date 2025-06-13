import {Card, CardContent} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from "@/components/ui/carousel";
import testPng from "@/assets/images/drone/cockpit/test.png";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import {useEffect, useState} from "react";

export function WorkOrderCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    // 监听轮播变化
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // 设置自动轮播
    const interval = setInterval(() => {
      const nextIndex = (current + 1) % 5; // 5是轮播项的总数
      api.scrollTo(nextIndex);
    }, 3000); // 每3秒切换一次

    return () => {
      clearInterval(interval);
    };
  }, [api, current]);

  return (
    <Carousel className="w-full" setApi={setApi}>
      <CarouselContent>
        {Array.from({length: 5}).map((_, index) => (
          <CarouselItem key={index}>
            <div className="h-[268px]">
              <Card className={"h-full bg-cockpit-workorder border-none"} style={{
                backgroundSize: "100% 100%"
              }}>
                <CardContent className="py-12 px-6 h-full relative text-white grid grid-cols-2 gap-x-4">
                  <MediaPreview
                    modalWidth="1000px"
                    modalHeight="800px"
                    src={testPng} type={"image"}
                    triggerElement={<img className={"aspect-square"}
                                         src={testPng} alt=""/>}/>
                  <MediaPreview
                    modalWidth="1000px"
                    modalHeight="800px"
                    src={testPng} type={"image"}
                    triggerElement={<img className={"aspect-square"}
                                         src={testPng} alt=""/>}/>
                  {/*<img className={"aspect-square"} src={testPng} alt=""/>*/}
                  <div
                    className={"text-white absolute bottom-[4px] text-lg max-w-[250px] truncate left-1/2 -translate-x-1/2"}
                    title={"路面垃圾检测"}>
                    路面垃圾检测 2025-03-28路面垃圾检测路面垃圾检测
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
