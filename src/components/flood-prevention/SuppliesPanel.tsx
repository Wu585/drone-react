import closePng from "@/assets/images/panel-close.png";
import {FC, useEffect} from "react";
import {useFpMaterialReserves} from "@/hooks/flood-prevention/api.ts";

interface Props {
  onClose?: () => void;
  address: string;
}

const suppliesMap: Record<string, { name: string; value: number }> = {
  "编织袋": {name: "fp_bzd", value: 0},
  "草包": {name: "fp_cb", value: 0},
  "麻袋": {name: "fp_md", value: 0},
  "尼龙绳": {name: "fp_nls", value: 0},
  "麻绳": {name: "fp_ms", value: 0},
  "挡水板": {name: "fp_dsb", value: 0},
  "装配式围井": {name: "fp_zpswj", value: 0},
  "阻水袋": {name: "fp_zsd", value: 0},
  "桩木": {name: "fp_zm", value: 0},
  "毛竹": {name: "fp_mz", value: 0},
  "砂石料": {name: "fp_ssl", value: 0},
  "块石": {name: "fp_sk", value: 0},
  "铅丝、钢丝绳": {name: "fp_qs_gss", value: 0},
  "叉车": {name: "fp_chache", value: 0},
  "铲车": {name: "fp_chanche", value: 0},
  "土方车": {name: "fp_ftc", value: 0},
  "吊车": {name: "fp_dc", value: 0},
  "推土机": {name: "fp_ttj", value: 0},
  "挖掘机": {name: "fp_wjj", value: 0},
  "吊臂升降机": {name: "fp_dbsjj", value: 0},
  "救生圈": {name: "fp_jsq", value: 0},
  "救生衣": {name: "fp_jsy", value: 0},
  "橡皮船": {name: "fp_xpt", value: 0},
  "冲锋舟": {name: "fp_cfz", value: 0},
  "巡逻艇": {name: "fp_xlt", value: 0},
  "升降式照明灯": {name: "fp_sjszmd", value: 0},
  "雨伞": {name: "fp_ys", value: 0},
  "雨衣": {name: "fp_yy", value: 0},
  "雨鞋": {name: "fp_yx", value: 0},
  "移动式发电机组": {name: "fp_ydsfdj", value: 0},
  "配电箱": {name: "fp_pdx", value: 0},
  "电缆": {name: "fp_dl", value: 0},
};

const SuppliesPanel: FC<Props> = ({onClose, address}) => {
  const {data: fpMaterialReserves} = useFpMaterialReserves();

  useEffect(() => {
    if (!fpMaterialReserves) return;
    if (address) {
      const current = fpMaterialReserves.filter(item => address.includes(item.materialRusticate));
      current.forEach(item => {
        for (const key in suppliesMap) {
          if (item.materialType === suppliesMap[key].name) {
            suppliesMap[key].value = item.materialCount;
          }
        }
      });
    }
  }, [address, fpMaterialReserves]);

  const onClosePanel = () => {
    onClose?.();
  };

  return (
    <div className="bg-supplies-panel h-full w-full bg-100% relative text-white">
      <div className={"absolute top-[28px] left-[48px] text-[22px] font-semibold"}>防汛物资详情</div>
      <img onClick={onClosePanel} className={"absolute right-[12px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"absolute left-[32px] flex top-[90px] space-x-2"}>
        <div>
          <span>位置：</span>
          <span className={"text-[#3ADEFF]"}>{address}</span>
        </div>
        <div>
          <span>联系人：</span>
          <span className={"text-[#3ADEFF]"}>芦二广</span>
        </div>
        <div>
          <span>联系方式：</span>
          <span className={"text-[#3ADEFF]"}>13341870016</span>
        </div>
      </div>
      <div className={"absolute top-[140px] w-full h-[550px] pl-[20px] pr-[4px] overflow-auto space-y-2"}>
        <div className={"h-[300px] flex items-center space-x-4 pl-8"} style={{
          background: "linear-gradient(to top, rgba(31, 142, 255, 0.4) 0%, rgba(31, 142, 255, 0) 100%)"
        }}>
          <div className={"w-[100px]"}>
            抢险物资
          </div>
          <div className={"h-full whitespace-nowrap flex flex-col justify-center"}>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>编制物料</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>编织袋</span>
                  <span>{suppliesMap["编织袋"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>草包</span>
                  <span>{suppliesMap["草包"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>麻袋</span>
                  <span>{suppliesMap["麻袋"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>线绳</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>尼龙绳</span>
                  <span>{suppliesMap["尼龙绳"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>麻绳</span>
                  <span>{suppliesMap["麻绳"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>麻袋</span>
                  <span>{suppliesMap["麻袋"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>阻水</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>挡水板</span>
                  <span>{suppliesMap["挡水板"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>装配式围井</span>
                  <span>{suppliesMap["装配式围井"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>阻水袋</span>
                  <span>{suppliesMap["阻水袋"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>木料</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>桩木</span>
                  <span>{suppliesMap["桩木"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>毛竹</span>
                  <span>{suppliesMap["毛竹"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>石料</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>砂石料</span>
                  <span>{suppliesMap["砂石料"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>块石</span>
                  <span>{suppliesMap["块石"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>钢材</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>铅丝、钢丝绳</span>
                  <span>{suppliesMap["铅丝、钢丝绳"].value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"h-[200px] flex items-center space-x-4 pl-8 whitespace-nowrap"} style={{
          background: "linear-gradient(to top, rgba(255, 122, 51, 0.4) 0%, rgba(255, 122, 51, 0) 100%)"
        }}>
          <div className={"w-[100px]"}>
            大型抢救器械
          </div>
          <div className={"h-full whitespace-nowrap flex flex-col justify-center"}>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>运输车辆</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>叉车</span>
                  <span>{suppliesMap["叉车"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>铲车</span>
                  <span>{suppliesMap["铲车"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>土方车</span>
                  <span>{suppliesMap["土方车"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>机械设备</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>吊车</span>
                  <span>{suppliesMap["吊车"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>推土机</span>
                  <span>{suppliesMap["推土机"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>挖掘机</span>
                  <span>{suppliesMap["挖掘机"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>吊臂升降机</span>
                  <span>{suppliesMap["吊臂升降机"].value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"h-[200px] flex items-center space-x-4 pl-8 whitespace-nowrap"} style={{
          background: "linear-gradient(to top, rgba(44, 222, 217, 0.4) 0%, rgba(44, 222, 217, 0) 100%)"
        }}>
          <div className={"w-[100px]"}>
            救生器材
          </div>
          <div className={"h-full whitespace-nowrap flex flex-col justify-center"}>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>救生衣圈</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>救生圈</span>
                  <span>{suppliesMap["救生圈"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>救生衣</span>
                  <span>{suppliesMap["救生衣"].value}</span>
                </div>
              </div>
            </div>
            <div className={"flex items-center"}>
              <div className={"text-[#68B1FF] w-[80px]"}>救生船</div>
              <div className={"flex px-[16px] space-x-6"}>
                <div className={"flex flex-col w-[70px]"}>
                  <span>橡皮船</span>
                  <span>{suppliesMap["橡皮船"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>冲锋舟</span>
                  <span>{suppliesMap["冲锋舟"].value}</span>
                </div>
                <div className={"flex flex-col w-[70px]"}>
                  <span>巡逻艇</span>
                  <span>{suppliesMap["巡逻艇"].value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliesPanel;

