import closePng from "@/assets/images/panel-close.png";
import {cn, getImageUrl} from "@/lib/utils.ts";
import {deleteFacility, FacilityInfo, useAllFacilities} from "@/hooks/facilities/api.ts";
import {Button} from "@/components/ui/button.tsx";
import {useToast} from "@/components/ui/use-toast.ts";
import {pickPosition} from "@/components/toolbar/tools";

interface FacilitiesPanelProps {
  onClose?: () => void;
  content: Partial<FacilityInfo>;
  onChangeLocation?: ({longitude, latitude, content}: {
    longitude: string | number,
    latitude: string | number,
    content: Partial<FacilityInfo>
  }) => void;
  onEdit?: ({content}: { content: Partial<FacilityInfo> }) => void;
}

interface FacilityItemProps {
  imageUrl: string;
  facilityName?: string | null;
  replaceName?: string;
  exist?: boolean;
  colSpan?: number;
  classname?: string;
}

const FacilityItem = ({imageUrl, facilityName, exist, replaceName, classname}: FacilityItemProps) => {
  return (
    <div
      style={{
        backgroundSize: "100% 100%"
      }}
      className={cn("bg-no-repeat bg-facility-item flex flex-col justify-center items-center space-y-4", exist ? "" : "opacity-30", classname)}>
      <img src={getImageUrl(imageUrl)} alt=""/>
      <div className={"px-8"}>{facilityName || replaceName}</div>
    </div>
  );
};

const FacilitiesPanel = ({onClose, content, onChangeLocation, onEdit}: FacilitiesPanelProps) => {
  const {mutate} = useAllFacilities();
  const {toast} = useToast();

  const {
    address, longitude, latitude, neighborhoodCommittee,
    partyPosition, healthServices, nursingHome, park,
    culturalActivityCenter, elderlyActivityRoom, meetingRoom,
    library, lifeStation, communityCafeteria, elderlyCenter,
    dayCareCenters, elderlySportsHome
  } = content;

  const onDeleteFacility = async () => {
    content.id && await deleteFacility(content.id.toString());
    await mutate();
    toast({description: "删除设施成功"});
    onClose?.();
  };

  const _onChangeLocation = () => {
    onClosePanel();
    pickPosition(({longitude, latitude}) => {
      onChangeLocation?.({longitude, latitude, content});
    });
  };

  const _onEdit = () => {
    onClosePanel();
    onEdit?.({content});
  };

  const onClosePanel = () => {
    onClose?.();
  };

  return (
    <div className={"bg-facilities-panel h-full w-full bg-100% relative"}>
      <div className={"absolute top-[28px] left-[48px] text-[22px] font-semibold"}>公共设施详情</div>
      <img onClick={onClosePanel} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"absolute left-[32px] top-[90px] px-[24px] flex space-x-[32px]"}>
        <div className={"space-x-2"}>
          <span>地址：</span>
          <span className={"text-[#3ADEFF]"}>{address}</span>
        </div>
        <div className={"space-x-2"}>
          <span>经度：</span>
          <span className={"text-[#3ADEFF]"}>{longitude}</span>
        </div>
        <div className={"space-x-2"}>
          <span>纬度：</span>
          <span className={"text-[#3ADEFF]"}>{latitude}</span>
        </div>
        <div className={"space-x-2"}>
          <span>所属居委：</span>
          <span className={"text-[#3ADEFF]"}>{neighborhoodCommittee}</span>
        </div>
      </div>
      {content.facilitiesType && <div className={"absolute left-[32px] top-[130px] flex space-x-[24px]"}>
        <Button onClick={_onEdit} style={{background: "rgba(61,202,255,0.2)"}}
                className={"text-[20px] text-[#6ad6ff] px-[24px]"}>编辑</Button>
        <Button onClick={_onChangeLocation} style={{background: "rgba(61,202,255,0.2)"}}
                className={"text-[20px] text-[#6ad6ff] px-[24px]"}>修改位置</Button>
        <Button onClick={onDeleteFacility} style={{background: "rgba(61,202,255,0.2)"}}
                className={"text-[20px] text-[#6ad6ff] px-[24px]"}>删除点位</Button>
      </div>}
      <div
        className={cn("absolute bottom-0 w-full h-[600px] grid grid-cols-5 gap-4 p-[24px]", content.facilitiesType && "h-[570px]")}>
        <FacilityItem imageUrl={"dqfyz"} facilityName={partyPosition} exist={!!partyPosition}
                      replaceName={"党群服务站"}/>
        <FacilityItem imageUrl={"wsz"} facilityName={healthServices} exist={!!healthServices} replaceName={"卫生站"}/>
        <FacilityItem imageUrl={"jly"} facilityName={nursingHome} exist={!!nursingHome} replaceName={"敬老院"}/>
        <FacilityItem imageUrl={"gy"} facilityName={park} exist={!!park} replaceName={"公园"}/>
        <FacilityItem imageUrl={"whhdzx"} facilityName={culturalActivityCenter} exist={!!culturalActivityCenter}
                      replaceName={"文化活动中心"}/>
        <FacilityItem imageUrl={"lnhds"} facilityName={"老年活动室"} exist={!!elderlyActivityRoom}
                      replaceName={"老年活动室"}/>
        <FacilityItem imageUrl={"hys"} facilityName={meetingRoom ? `会议室(${meetingRoom})` : ""}
                      exist={!!meetingRoom}
                      classname={"col-span-2"}
                      replaceName={"会议室"}/>
        <FacilityItem imageUrl={"tsg"} facilityName={library ? `图书馆(${library})` : ""} exist={!!library}
                      replaceName={"图书馆"}/>
        <FacilityItem imageUrl={"shyz"} facilityName={lifeStation} exist={!!lifeStation} replaceName={"生活驿站"}/>
        <FacilityItem imageUrl={"st"} facilityName={communityCafeteria} exist={!!communityCafeteria}
                      replaceName={"食堂"}/>
        <FacilityItem imageUrl={"zczx"} facilityName={elderlyCenter} exist={!!elderlyCenter} replaceName={"支持中心"}/>
        <FacilityItem imageUrl={"rjzlzx"} facilityName={dayCareCenters} exist={!!dayCareCenters}
                      replaceName={"日间照料中心"}/>
        <FacilityItem imageUrl={"ydzj"} facilityName={elderlySportsHome} exist={!!elderlySportsHome}
                      replaceName={"运动中心"}/>
      </div>
    </div>
  );
};

export default FacilitiesPanel;

