import titleIcon from "@/assets/images/drone/screen/title-icon.png";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";

const DeviceStatistics = () => {

  return (
    <div className={"bg-screen-content bg-full-size flex flex-col pr-[40px]"}>
      <header className={"bg-screen-title pl-[43px] bg-full-size h-[45px] flex items-center"}>设备统计</header>
      <div className={"flex-1pt-[16px] pl-[33px]"}>
        <div className={"flex space-x-[18px]"}>
          <div>
            <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
              <img src={titleIcon} className={"w-[12px]"} alt=""/>
              <span>设备数量</span>
            </div>
            <div style={{
              background: "linear-gradient( 270deg, rgba(13,32,69,0.87) 0%, rgba(16,48,101,0.98) 100%)"
            }} className={"w-[307px] py-[35px] pl-[26px] space-y-4"}>
              <div className={"flex space-x-8"}>
                <div className={"content-center"}>M30T</div>
                <div className={"space-y-2"}>
                  <div>总数量</div>
                  <div className={"space-x-4"}>
                    <span className={"text-[18px] text-[#62F677] font-semibold"}>36</span>
                    <span className={"text-[10px] text-[#62F677]"}>架</span>
                  </div>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>在线</span>
                  <span className={"text-[18px] text-[#00D2FF] font-semibold"}>13</span>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>离线</span>
                  <span className={"text-[18px] text-[#AFAFAF] font-semibold"}>1</span>
                </div>
              </div>
              <div className={"flex space-x-8"}>
                <div className={"content-center"}>M30T</div>
                <div className={"space-y-2"}>
                  <div>总数量</div>
                  <div className={"space-x-4"}>
                    <span className={"text-[18px] text-[#62F677] font-semibold"}>36</span>
                    <span className={"text-[10px] text-[#62F677]"}>架</span>
                  </div>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>在线</span>
                  <span className={"text-[18px] text-[#00D2FF] font-semibold"}>13</span>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>离线</span>
                  <span className={"text-[18px] text-[#AFAFAF] font-semibold"}>1</span>
                </div>
              </div>
              <div className={"flex space-x-8"}>
                <div className={"content-center"}>M30T</div>
                <div className={"space-y-2"}>
                  <div>总数量</div>
                  <div className={"space-x-4"}>
                    <span className={"text-[18px] text-[#62F677] font-semibold"}>36</span>
                    <span className={"text-[10px] text-[#62F677]"}>架</span>
                  </div>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>在线</span>
                  <span className={"text-[18px] text-[#00D2FF] font-semibold"}>13</span>
                </div>
                <div className={"flex flex-col space-y-2"}>
                  <span>离线</span>
                  <span className={"text-[18px] text-[#AFAFAF] font-semibold"}>1</span>
                </div>
              </div>
            </div>
          </div>
          <div className={"space-y-4 flex-1"}>
            <Select>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }}
                             className="w-[120px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold my-[13px]">
                <SelectValue placeholder="选择型号"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">M30T</SelectItem>
              </SelectContent>
            </Select>
            <div className={"w-[480px]"}>
              <NewCommonTable
                height={250}
                data={[
                  {
                    name: "M30T",
                    sn: "1581F5BMD239S002ZGK5",
                    status: 0,
                    weather: "多云",
                    rain: "20",
                    wind: 1,
                    task_status: "任务中"
                  },
                  {
                    name: "M30T",
                    sn: "1581F5BMD239S002ZGK5",
                    status: 0,
                    weather: "多云",
                    rain: "20",
                    wind: 1,
                    task_status: "任务中"
                  },
                  {
                    name: "M30T",
                    sn: "1581F5BMD239S002ZGK5",
                    status: 0,
                    weather: "多云",
                    rain: "20",
                    wind: 1,
                    task_status: "任务中"
                  },
                  {
                    name: "M30T",
                    sn: "1581F5BMD239S002ZGK5",
                    status: 0,
                    weather: "多云",
                    rain: "20",
                    wind: 1,
                    task_status: "任务中"
                  },
                ]}
                columns={[
                  {
                    key: "名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "编号",
                    render: (item) => <>{item.sn}</>
                  },
                  {
                    key: "状态",
                    render: (item) => <>{item.status === 0 ? "在线" : "离线"}</>
                  },
                  {
                    key: "天气",
                    render: (item) => <>{item.weather}</>
                  },
                  {
                    key: "降雨量",
                    render: (item) => <>{item.rain}</>
                  },
                  {
                    key: "风力",
                    render: (item) => <>{item.wind}</>
                  },
                  {
                    key: "任务状态",
                    render: (item) => <>{item.task_status}</>
                  },
                ]}
              />
            </div>
          </div>
        </div>
        <div className={""}>
          <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
            <img src={titleIcon} className={"w-[12px]"} alt=""/>
            <span>任务详情</span>
          </div>
          <div className={"h-[62px] bg-screen-task-detail bg-full-size mb-[44px] flex items-center pl-[72px] space-x-[40px]"}>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>设备名称</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>飞行器一</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>设备型号</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>M30T</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>设备编号</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>YX2923907</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>任务名称</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>巡查检备</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>任务状态</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>任务中</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>任务执行时间</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>20:00:00-20:30:00</span>
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-[12px]"}>执行状态</span>
              <span className={"font-semibold text-[12px] text-[#6ED7FF]"}>成功</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatistics;

