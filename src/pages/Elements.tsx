import {
  ChevronRight, Circle,
  DiamondIcon, Eye, EyeOff,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Spline,
  Square,
  Trash2
} from "lucide-react";
import Scene from "@/components/drone/public/Scene.tsx";
import MapChange from "@/components/drone/public/MapChange.tsx";
import {
  deleteElementById,
  ElementParam,
  Layer, toggleVisibleElementById,
  useElementActions,
  useElementsGroup,
  useElementsGroupActions
} from "@/hooks/drone/elements";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "@/components/ui/use-toast.ts";
import DrawPanel from "@/components/drone/elements/DrawPanel.tsx";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ElementInfo, {Element} from "@/components/drone/elements/ElementInfo.tsx";
import {MapElementEnum} from "@/types/map.ts";
import PermissionButton from "@/components/drone/public/PermissionButton.tsx";
import {usePermission} from "@/hooks/drone";
import CommonDialog from "@/components/drone/public/CommonDialog.tsx";
import {IconButton} from "@/components/drone/public/IconButton.tsx";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";
import CommonAlertDialog from "@/components/drone/public/CommonAlertDialog.tsx";

const GroupItem = ({
                     group,
                     level = 0,
                     selected,
                     onSelect,
                     onUpdate,
                     onDelete,
                     onDeleteElement,
                     onClickEdit,
                     onVisibleChange
                   }: {
  group: Layer;
  level?: number;
  selected: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteElement: (id: string) => Promise<void>;
  onClickEdit: (element?: ElementParam) => void
  onVisibleChange?: (groupId: string, elementId: string, visible: boolean) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(group.name);

  return (
    <div className="space-y-1 ">
      <div
        className={cn(
          "flex items-center h-9 cursor-pointer hover:bg-[#43ABFF]/10 group relative",
          selected === group.id && "bg-[#43ABFF]/20",
          level > 0 && "ml-4"
        )}
        onClick={() => onSelect(group.id)}
      >
        <div className="w-6 flex items-center justify-center shrink-0">
          {(group.elements?.length > 0) && (
            <ChevronRight
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={cn(
                "h-4 w-4 transition-transform text-gray-500",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </div>

        <div className="w-6 flex items-center justify-center shrink-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-orange-400"/>
          ) : (
            <Folder className="h-4 w-4 text-orange-400"/>
          )}
        </div>

        <span className=" text-white truncate flex-1  text-base" title={group.name}>{group.name}</span>

        {/* 操作按钮组 */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 absolute right-2">
          <CommonDialog
            open={showEdit} onOpenChange={setShowEdit}
            title={"编辑文件夹"}
            trigger={
              <IconButton
                size={"sm"}
                permissionKey={"Collection_AnnotationEdit"}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditName(group.name);
                }}
              >
                <Pencil size={16}/>
              </IconButton>}
            onConfirm={async () => {
              await onUpdate(group.id, editName);
              setShowEdit(false);
            }}
          >
            <div className={"grid grid-cols-10 items-center"}>
              <Label className="mr-4 whitespace-nowrap col-span-2">文件夹名称：</Label>
              <CommonInput
                className={"col-span-8"}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </CommonDialog>

          <CommonAlertDialog
            title={"删除文件夹"}
            trigger={
              <IconButton permissionKey={"Collection_AnnotationEdit"}>
                <Trash2 size={16}/>
              </IconButton>
            }
            description={<div>确定要删除文件夹 "{group.name}" 吗？此操作不可恢复。</div>}
            onConfirm={() => onDelete(group.id)}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {group.elements.map(element => (
            <div
              key={element.id}
              className={cn(
                "flex items-center h-9 cursor-pointer hover:bg-[#43ABFF]/10 relative group",
                selected === element.id && "bg-[#43ABFF]/20",
                level > 0 ? "ml-8" : "ml-4"
              )}
            >
              <div className="w-6 flex items-center justify-center shrink-0"/>
              <div className="w-6 flex items-center justify-center shrink-0">
                {element.resource.type === MapElementEnum.PIN && <DiamondIcon className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.LINE && <Spline className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.POLY && <Square className="h-4 w-4 text-[#43ABFF]"/>}
                {element.resource.type === MapElementEnum.CIRCLE && <Circle className="h-4 w-4 text-[#43ABFF]"/>}
              </div>
              <span onClick={() => onSelect(element.id)}
                    className="w-40 text-base text-white truncate" title={element.name}>{element.name}</span>
              <div
                className={"opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 absolute right-2"}>
                <PermissionButton
                  permissionKey={"Collection_AnnotationVisibility"}
                  className={"w-6 h-6 p-1 bg-transparent hover:bg-[#43ABFF]/20 rounded"}
                >
                  {element.visual ? <Eye onClick={() => {
                      onVisibleChange?.(group.id, element.id, false);
                    }}/> :
                    <EyeOff onClick={() => {
                      onVisibleChange?.(group.id, element.id, true);
                    }}/>}
                </PermissionButton>
                {/* 编辑按钮 */}
                <PermissionButton
                  permissionKey={"Collection_AnnotationEdit"}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="p-1 hover:bg-[#43ABFF]/20 rounded bg-transparent h-6 w-6"
                >
                  <Pencil onClick={() => onClickEdit(element as ElementParam)} className=""/>
                </PermissionButton>
                <PermissionButton
                  permissionKey={"Collection_AnnotationEdit"}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 hover:bg-[#43ABFF]/20 rounded bg-transparent h-6 w-6 text-red-500"
                >
                  <Trash2 onClick={() => onDeleteElement(element.id)} className="h-4 w-4 text-red-500"/>
                </PermissionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Elements = () => {
  const departId = localStorage.getItem("departId");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [hasChild, setHasChild] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editElement, setEditElement] = useState<ElementParam>();
  const [editParam, setEditParam] = useState<Element>();

  const {data: groups, mutate} = useElementsGroup(departId ? +departId : undefined);
  const {addGroup, updateGroup, deleteGroup} = useElementsGroupActions();
  const {deleteElement, updateElement, updateElementVisible} = useElementActions();

  const [groupName, setGroupName] = useState("");

  // 查找节点的父节点ID
  const findParentId = (groups: Layer[], targetId: string): string => {
    // 先检查每个顶层组的elements
    for (const group of groups) {
      if (group.elements.some(element => element.id === targetId)) {
        return group.id;
      }
    }

    // 如果是组本身
    const group = groups.find(g => g.id === targetId);
    if (group) {
      return group.parent_id || "";
    }

    // 递归检查子组
    for (const group of groups) {
      const children = groups.filter(g => g.parent_id === group.id);
      const parentId = findParentId(children, targetId);
      if (parentId !== null) {
        return parentId;
      }
    }

    return "";
  };

  const isHasChild = (id: string) =>
    !!groups?.find(group => group.id === id);

  // 处理选中
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (groups) {
      const parentId = findParentId(groups, id);
      setSelectedParentId(parentId);
      setHasChild(isHasChild(id));
      console.log("Selected ID:", id, "Parent ID:", parentId, "has child", isHasChild(id));
      if (!isHasChild(id)) {
        viewer.flyTo(getCustomSource("elements")?.entities.getById(id), {
          duration: 1
        });
      }
    }
  };

  const onCreateGroup = async () => {
    try {
      await addGroup({
        name: groupName,
        parent_id: selectedParentId,
        organ: departId ? +departId : undefined,
      });
      toast({
        description: "创建成功"
      });
      await mutate();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    try {
      await updateGroup({group_id: id, name});
      toast({
        description: "更新成功"
      });
      await mutate();
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id);
      const group = groups?.find(group => group.id === id);
      group?.elements.forEach(item => deleteElementById(item.id));
      toast({
        description: "删除成功"
      });
      await mutate();

      // 如果删除的是当前选中的节点，清空选中状态
      if (selectedId === id) {
        setSelectedId("");
        setSelectedParentId("");
      }
    } catch (err: any) {
      toast({
        description: err.data.message,
        variant: "destructive"
      });
    }
  };

  const onDeleteElement = async (id: string) => {
    await deleteElement(id);
    deleteElementById(id);
    await mutate();
  };

  const onChangeVisible = async (groupId: string, id: string, visible: boolean) => {
    toggleVisibleElementById(id, visible);
    await updateElementVisible(groupId, id, visible);
    await mutate();
  };

  // 构建树状结构
  const buildTree = (groups: Layer[]) => {
    const topLevel = groups.filter(g => !g.parent_id);
    const getChildren = (parentId: string) => {
      return groups.filter(g => g.parent_id === parentId);
    };

    const renderGroup = (group: Layer) => {
      const children = getChildren(group.id);
      return (
        <div key={group.id}>
          <GroupItem
            onVisibleChange={onChangeVisible}
            group={group}
            selected={selectedId}
            onSelect={handleSelect}
            onUpdate={handleUpdateGroup}
            onDelete={handleDeleteGroup}
            onDeleteElement={(id) => onDeleteElement(id)}
            onClickEdit={(element) => {
              setSheetOpen(true);
              setEditElement(element);
            }}
          />
          {children.length > 0 && (
            <div className="ml-4">
              {children.map(child => renderGroup(child))}
            </div>
          )}
        </div>
      );
    };

    return topLevel.map(group => renderGroup(group));
  };

  const {hasPermission} = usePermission();

  return (
    <div className="h-full flex">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#072E62] border border-[#43ABFF] text-white">
          <SheetHeader>
            <SheetTitle className="text-white mb-4">标注信息：</SheetTitle>
          </SheetHeader>
          <ElementInfo
            element={editElement!}
            onParamChange={setEditParam}
          />
          <SheetFooter>
            <Button
              onClick={async () => {
                if (editElement && editParam) {
                  try {
                    await updateElement(editElement.id, {
                      name: editParam.name,
                      content: {
                        ...editElement.resource.content,
                        properties: {
                          ...editElement.resource.content.properties,
                          color: editParam.color
                        }
                      },
                    });
                    toast({
                      description: "更新成功"
                    });
                    await mutate();
                    setSheetOpen(false);
                  } catch (err: any) {
                    toast({
                      description: err.data?.message || "更新失败",
                      variant: "destructive"
                    });
                  }
                }
              }}
              className="bg-[#0A81E1] hover:bg-[#0A81E1]/80 text-white"
            >
              保存
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="w-[340px] min-w-[340px] border-[1px] border-[#43ABFF] bg-gradient-to-l
        from-[#32547E]/[.5] to-[#1F2D4B] border-l-0 rounded-tr-lg rounded-br-lg flex flex-col">
        <div
          className="flex items-center space-x-4 border-b-[1px] border-b-[#265C9A] px-[12px] py-4 text-sm justify-between">
          <div className={"h-8 text-base"}>地图标注</div>
          <CommonDialog
            title={"新建文件夹"}
            trigger={
              <IconButton>
                <FolderPlus size={18} className="cursor-pointer text-orange-400"/>
              </IconButton>
            }
            onConfirm={onCreateGroup}
          >
            <div className={"grid grid-cols-10 items-center"}>
              <Label className="mr-4 whitespace-nowrap col-span-2">文件夹名称：</Label>
              <CommonInput
                className={"col-span-8"}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          </CommonDialog>
        </div>
        <div className="flex-1 px-[12px] py-4 space-y-2 overflow-y-auto">
          {(!groups || groups?.length === 0) && <div className={"content-center py-8 text-[#d0d0d0]"}>暂无数据</div>}
          {groups && groups?.length > 0 && buildTree(groups)}
        </div>
      </div>
      <div className="flex-1 min-w-0 ml-[20px] border-[2px] rounded-lg border-[#43ABFF] relative overflow-hidden">
        <Scene/>
        {hasPermission("Collection_AnnotationEdit") && <div className="absolute right-6 top-80">
          <DrawPanel
            onSuccess={() => mutate()}
            groupId={hasChild ? selectedId : selectedParentId}
          />
        </div>}
        <div className="absolute right-0 bottom-0 z-[30]">
          <MapChange/>
        </div>
      </div>
    </div>
  );
};

export default Elements;

