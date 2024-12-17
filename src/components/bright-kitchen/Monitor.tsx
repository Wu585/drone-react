import sbzsPng from "@/assets/images/monitor-camera.png";
import gzsPng from "@/assets/images/monitor-camera-broken.png";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";

const Monitor = () => {
  return (
    <div className={"space-y-4"}>
      <div className={"flex space-x-8"}>
        <div className={"flex space-x-2"}>
          <img src={sbzsPng} alt=""/>
          <div className={"flex flex-col items-center justify-center"}>
            <span className={"text-[#33DAFC] text-[38px] font-bold"}>24</span>
            <span>设备总数</span>
          </div>
        </div>
        <div className={"flex space-x-2"}>
          <img src={gzsPng} alt=""/>
          <div className={"flex flex-col items-center justify-center"}>
            <span className={"text-[#FF5754] text-[38px] font-bold"}>0</span>
            <span>故障数</span>
          </div>
        </div>
      </div>
      <div>
        <div className={"font-semibold text-[20px]"}>故障信息详情</div>
        <NewCommonTable
          height={200}
          data={[
            {
              id: "鱼你在一起",
              time: "2024.05.08 15:03:02",
              address: "宝龙广场B1层",
              reason: "离线",
            },
            {
              id: "辛大厨",
              time: "2024.06.12 18:12:02",
              address: "宝龙广场B1层",
              reason: "离线",
            },
            {
              id: "蒋大厨",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场B1层",
              reason: "离线",
            },
            {
              id: "榴莉千层",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场B1层",
              reason: "离线",
            },
            {
              id: "南昌七十七路",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场B1层",
              reason: "离线",
            },
            {
              id: "海伦司",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "酒井",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "蛙喔",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "泰叶",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "九鼎轩",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "焱匠寿喜烧",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "西塔",
              time: "2024.07.03 09:00:12",
              address: "宝龙广场4楼",
              reason: "离线",
            },
            {
              id: "久二蛙",
              time: "2024.07.03 09:00:12",
              address: "韩村路370号",
              reason: "离线",
            },
            {
              id: "贵州土黄牛肉火锅",
              time: "2024.07.03 09:00:12",
              address: "韩村路452号",
              reason: "离线",
            },
            {
              id: "豫见胡辣汤",
              time: "2024.07.03 09:00:12",
              address: "韩村路458号",
              reason: "离线",
            },
            {
              id: "尚速大食堂",
              time: "2024.07.03 09:00:12",
              address: "韩村路498号",
              reason: "离线",
            },
            {
              id: "有家川味骨汤麻辣烫",
              time: "2024.07.03 09:00:12",
              address: "韩村路528号",
              reason: "离线",
            },
            {
              id: "泉味源黄焖鸡米饭",
              time: "2024.07.03 09:00:12",
              address: "韩村路560号",
              reason: "离线",
            },
            {
              id: "木子私厨",
              time: "2024.07.03 09:00:12",
              address: "韩村路588号",
              reason: "离线",
            },
          ]}
          columns={[
            {
              key: "设备名称",
              render: (item) => <>{item.id}</>
            },
            /*{
              key: "故障时间",
              render: (item) => <>{item.time}</>
            },*/
            {
              key: "位置",
              render: (item) => <>{item.address}</>
            },
            {
              key: "故障类型",
              render: (item) => <>{item.reason}</>
            }
          ]}/>
      </div>
    </div>
  );
};

export default Monitor;

