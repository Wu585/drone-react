import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {Input} from "@/components/ui/input.tsx";
import {getImageUrl} from "@/lib/utils.ts";
import {flyToCartesian3, getCameraParam} from "@/lib/view.ts";
import {addViewPoint, deleteViewPoint, updateViewPoint, useViewPointList, ViewPoint} from "@/hooks/tools/api.ts";
import {KeyboardEvent} from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {useToast} from "@/components/ui/use-toast.ts";

interface ViewManageProps {
  onClose?: () => void;
}

const ViewManage = ({onClose}: ViewManageProps) => {
  const {toast} = useToast();
  const {data: viewPointList, mutate} = useViewPointList();

  const onAddView = async () => {
    const camera = getCameraParam();
    await addViewPoint({
      ...camera,
      locationName: "新视点"
    });
    await mutate();
    toast({
      description: "添加视点成功"
    });
  };

  const flyTo = ({locationX, locationY, locationZ, rotaionHeading, rotaionPitch, rotationRoll}: ViewPoint) => {
    flyToCartesian3({
      locationX: +locationX, locationY: +locationY, locationZ: +locationZ,
      rotaionHeading: +rotaionHeading, rotaionPitch: +rotaionPitch, rotationRoll: +rotationRoll
    });
  };

  const onDelete = async ({id}: ViewPoint) => {
    await deleteViewPoint(id);
    await mutate();
    toast({
      description: "删除视点成功"
    });
  };

  const onEdit = async (point: ViewPoint) => {
    const camera = getCameraParam();
    await updateViewPoint({
      ...camera,
      id: point.id
    });
    await mutate();
    toast({
      description: "编辑视点成功"
    });
  };

  const onEditName = async (e: KeyboardEvent, {id}: ViewPoint) => {
    if (e.key === "Enter") {
      const value = (e.target as HTMLInputElement).value;
      await updateViewPoint({
        id,
        locationName: value
      });
      await mutate();
      toast({
        description: "编辑视点成功"
      });
    }
  };

  return (
    <div className={"w-[380px] h-[283px]"}>
      <DetailPanelLayout contentType={"component"} onClose={onClose} title={"视点管理"}>
        <div className={"h-[150px] overflow-auto mb-[16px]"}>
          {viewPointList?.map((point) => <div key={point.id} className={"flex justify-between items-center"}>
            <Input defaultValue={point.locationName} onKeyUp={(e) => onEditName(e, point)}
                   className={"text-[18px] bg-transparent text-white border-none"}/>
            <div className={"flex space-x-2 pr-[24px]"}>
              <img onClick={() => flyTo(point)} src={getImageUrl("fly-to")} alt=""/>
              <img onClick={() => onEdit(point)} src={getImageUrl("edit")} alt=""/>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <img src={getImageUrl("delete")} alt=""/>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除视点</AlertDialogTitle>
                    <AlertDialogDescription>
                      确认删除视点吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(point)}>确定</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>)}
        </div>
        <div
          onClick={onAddView}
          className={"w-[140px] h-[32px] bg-[#166ff2] rounded-full flex items-center justify-center cursor-pointer"}>
          添加视点
        </div>
      </DetailPanelLayout>
    </div>
  );
};

export default ViewManage;

