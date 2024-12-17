import {Button} from "@/components/ui/button.tsx";
import intro1Image from "@/assets/home/intro-1.png";
import lineImage from "@/assets/home/line.png";
import dwytTextImage from "@/assets/home/dwyt-text.png";
import dwytImage from "@/assets/home/dwyt.png";
import rhTextImage from "@/assets/home/rh-text.png";
import rhImage from "@/assets/home/rh.png";
import ztyyfwTextImage from "@/assets/home/ztyyfw-text.png";
import ztyyfwImage from "@/assets/home/ztyyfw.png";

const Home = () => {
  return (
    <>
      <div
        className={"text-[44px] font-semibold tracking-[1px] font-Pingfang absolute top-[217px] left-1/2 -translate-x-1/2"}>
        数字化创新 驱动化工区转型发展
      </div>
      <Button className={"font-Pingfang text-[16px] tracking-[1px] absolute " +
        "top-[338px] left-1/2 -translate-x-1/2 cursor-pointer bg-transparent hover:bg-transparent border-2 rounded-none px-8"}>
        立即体验
      </Button>
      <div className={"absolute left-1/2 -translate-x-1/2 bottom-[374px]"}>
        <img src={intro1Image} alt=""/>
      </div>
      <div className={"absolute left-1/2 -translate-x-1/2 bottom-[351px]"}>
        <img src={lineImage} alt=""/>
      </div>
      <div
        className={"absolute left-1/2 -translate-x-1/2 bottom-[170px] flex space-x-32 items-center justify-center whitespace-nowrap"}>
        <div style={{backgroundSize: "100% 100%"}} className={"px-[50px] py-[30px] bg-zt"}>
          <div className={"w-[86px] h-[22px] pb-[20px]"}>
            <img src={dwytTextImage} alt=""/>
          </div>
          <div className={"flex items-center justify-end"}>
            <div className={"font-Pingfang mr-[58px] py-[20px]"}>构建统一时空数据底座</div>
            <div className={"w-[44px]"}>
              <img src={dwytImage} alt=""/>
            </div>
          </div>
        </div>
        <div style={{backgroundSize: "100% 100%"}} className={"px-[50px] pt-[30px] pb-[21px] bg-zt"}>
          <div className={"w-[135px] h-[22px] pb-[20px]"}>
            <img src={rhTextImage} alt=""/>
          </div>
          <div className={"flex items-center justify-end"}>
            <div className={"font-Pingfang mr-[58px] pt-[20px] leading-[28px]"}>GIS电子沙盘快速定制 <br/> 一体化协作平台
            </div>
            <div className={"w-[44px]"}>
              <img src={rhImage} alt=""/>
            </div>
          </div>
        </div>
        <div style={{backgroundSize: "100% 100%"}} className={"px-[50px] pt-[30px] pb-[21px] bg-zt"}>
          <div className={"w-[132px] h-[22px] pb-[20px]"}>
            <img src={ztyyfwTextImage} alt=""/>
          </div>
          <div className={"flex items-center justify-end"}>
            <div className={"font-Pingfang mr-[58px] pt-[20px] leading-[28px]"}>面向二三维的不同应用场<br/>景，构建开放服务平台
            </div>
            <div className={"w-[44px]"}>
              <img src={ztyyfwImage} alt=""/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

