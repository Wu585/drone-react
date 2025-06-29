import {useState, useEffect, createRef, RefObject} from "react";
import {
  ArrowLeftToLine,
  ArrowRightFromLine,
  Drone,
  Grid2x2,
  Grid3x3,
  Logs,
  Package2,
  Square,
  Undo2,
  Video,
  X
} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useDeviceTopo} from "@/hooks/drone";
import {Link} from "react-router-dom";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {cn} from "@/lib/utils.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";
import {IconButton} from "@/components/drone/public/IconButton.tsx";

enum MultiGrid {
  "1*1" = 1,
  "2*2",
  "3*3",
  "4*4",
}

interface LiveStream {
  id: string;
  dockSn: string;
  droneSn?: string;
  isDock: boolean;
  title: string;
  videoRef: RefObject<HTMLVideoElement>;
}

const StreamItem = ({stream, onRemove, index, onDragStart, onDragOver, onDrop, onDragEnd}: {
  stream: LiveStream;
  onRemove: (id: string) => void;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}) => {
  const {startLive} = useDeviceLive(
    stream.videoRef.current,
    stream.dockSn,
    stream.droneSn,
    false
  );

  useEffect(() => {
    if (stream.videoRef.current) {
      startLive(stream.isDock);
    }
  }, [stream.videoRef, stream.isDock, startLive]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className="bg-[#1E3557] rounded-md relative overflow-hidden cursor-move"
    >
      <video
        ref={stream.videoRef}
        className="w-full h-full object-fill rounded-md aspect-video"
        autoPlay
        muted
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {stream.title}
      </div>
      <Button
        onClick={() => onRemove(stream.id)}
        className="absolute top-2 right-2 p-1 h-6 w-6 bg-black bg-opacity-50 hover:bg-opacity-70"
        size="icon"
      >
        <X size={14}/>
      </Button>
    </div>
  );
};

const MultiLivePage = () => {
  useInitialConnectWebSocket();

  const {
    deviceState,
    clearDeviceState
  } = useSceneStore();

  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [grid, setGrid] = useState<MultiGrid>(MultiGrid["2*2"]);
  // gridStreams: 每个格子一个流或null
  const [gridStreams, setGridStreams] = useState<(LiveStream | null)[]>(Array(MultiGrid["2*2"] * MultiGrid["2*2"]).fill(null));
  const {data: dockList} = useDeviceTopo();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    clearDeviceState();
  }, [clearDeviceState]);

  // grid变化时，调整gridStreams长度
  useEffect(() => {
    setGridStreams(prev => {
      const total = Number(grid) * Number(grid);
      if (prev.length === total) return prev;
      if (prev.length > total) return prev.slice(0, total);
      return [...prev, ...Array(total - prev.length).fill(null)];
    });
  }, [grid]);

  // 新增流，插入第一个空位
  const addStream = (dockSn: string, droneSn: string | undefined, isDock: boolean, title: string) => {
    // 已存在则不添加
    if (gridStreams.some(s => s && s.dockSn === dockSn && s.isDock === isDock && (!droneSn || s.droneSn === droneSn))) return;
    const newStream: LiveStream = {
      id: `${dockSn}-${isDock ? "dock" : "drone"}-${Date.now()}`,
      dockSn,
      droneSn,
      isDock,
      title,
      videoRef: createRef<HTMLVideoElement>()
    };
    setGridStreams(prev => {
      const idx = prev.findIndex(s => s === null);
      if (idx === -1) return prev; // 没空位
      const arr = [...prev];
      arr[idx] = newStream;
      return arr;
    });
  };

  // 删除流
  const removeStream = (id: string) => {
    setGridStreams(prev => prev.map(s => (s && s.id === id ? null : s)));
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", (e.target as HTMLElement).innerHTML);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // 拖拽释放，交换或插入
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIdx) return;
    setGridStreams(prev => {
      const arr = [...prev];
      const dragged = arr[draggedIndex];
      if (!dragged) return arr;
      if (arr[dropIdx]) {
        // 目标有流，直接交换
        [arr[draggedIndex], arr[dropIdx]] = [arr[dropIdx], arr[draggedIndex]];
      } else {
        // 目标为空，移动
        arr[draggedIndex] = null;
        arr[dropIdx] = dragged;
      }
      return arr;
    });
    setDraggedIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  // grid变化时裁剪多余流
  const changeGrid = (newGrid: MultiGrid) => {
    setGrid(newGrid);
  };

  // 渲染所有格子
  const renderGridLayout = () => {
    const gridSize = Number(grid);
    const gridTemplate = `repeat(${gridSize}, 1fr)`;
    const totalSlots = gridSize * gridSize;
    return (
      <div
        className="w-full h-full grid gap-2"
        style={{
          gridTemplateColumns: gridTemplate,
          gridTemplateRows: gridTemplate
        }}
      >
        {Array.from({length: totalSlots}).map((_, slotIdx) => {
          const stream = gridStreams[slotIdx];
          if (stream) {
            return (
              <StreamItem
                key={stream.id}
                stream={stream}
                onRemove={removeStream}
                index={slotIdx}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            );
          } else {
            return (
              <div
                key={`empty-${slotIdx}`}
                className="bg-[#1E3557] rounded-md flex items-center justify-center min-h-[80px]"
                onDragOver={(e) => handleDragOver(e, slotIdx)}
                onDrop={(e) => handleDrop(e, slotIdx)}
              >
                <span className="text-gray-500">暂无视频</span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex space-x-[16px]">
      <div className="bg-gradient-to-l from-[#2C4372] to-[#35537F] flex rounded-lg">
        {/* 修改了这部分动画相关的className */}
        <div
          className={cn(
            "py-4 flex flex-col pb-8 overflow-hidden transition-all duration-300 ease-in-out",
            isMenuExpanded ? "w-[315px] px-2" : "w-0 opacity-0 md:opacity-100"
          )}
        >
          <h1 className={"pb-4 px-2 flex items-center justify-between whitespace-nowrap"}>
            <span>机场</span>
            <Link to={"/tsa"}>
              <Undo2/>
            </Link>
          </h1>
          <div className={"flex-1 overflow-auto space-y-2"}>
            {(!dockList || dockList.length === 0) && (
              <div className={"text-center py-4 text-[#c0c0c0]"}>暂无数据</div>
            )}
            {dockList?.map(dock => (
              <div key={dock.id} className={"w-[296px] bg-multi-live-panel bg-full-size py-4 pl-7 pr-6 text-[#c0c0c0]"}>
                <div className={"flex items-center justify-between pb-2 border-b border-dashed border-gray-400"}>
                  <div className={"flex items-center"}>
                    <div
                      className={cn("w-2 h-2 rounded mr-2", deviceState.dockInfo[dock.device_sn || ""] ? "bg-[#2BE7FF]" : "bg-[#BABABA]")}></div>
                    <Package2 size={16}/>
                    <div className={"px-2 text-sm truncate w-40"}
                         title={dock.nickname}>{dock.device_name} | {dock.nickname}</div>
                  </div>
                  <Button
                    className={cn("px-2 h-6", gridStreams.some(s => s && s.isDock && s.dockSn === dock.device_sn) ? "bg-blue-500" : "bg-[#2A3145]/[.88]")}
                    onClick={() => addStream(dock.device_sn, undefined, true, `${dock.nickname} (机场)`)}
                  >
                    <Video size={18}/>
                  </Button>
                </div>
                <div className={"flex flex-col py-2"}>
                  <div className={"flex items-center pb-2"}>
                    <div
                      className={cn("w-2 h-2 rounded mr-2", deviceState.deviceInfo[dock.children?.device_sn || ""] ? "bg-[#2BE7FF]" : "bg-[#BABABA]")}></div>
                    <Drone size={16}/>
                    <div className={"pl-2 text-sm w-42 truncate"}
                         title={dock.children?.nickname}>{dock.children?.device_name} | {dock.children?.nickname}</div>
                  </div>
                  <Button
                    className={cn("bg-[#52607D]/[.88] content-center rounded-[1px] h-[24px] relative",
                      gridStreams.some(s => !s?.isDock && s?.droneSn === dock.children?.device_sn) ? "text-blue-400" : "text-[#c0c0c0]")}
                    onClick={() => addStream(dock.device_sn, dock.children?.device_sn, false, `${dock.children?.nickname} (飞行器)`)}
                  >
                    <Logs className={"absolute left-2"} size={16}/>
                    {dock.children?.device_name} 相机
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className={cn("w-[43px] flex flex-col justify-between items-center pb-2", isMenuExpanded ? "border-l-[1px] border-[#364E76]" : "border-none")}>
          <div className="py-2 flex-1 flex flex-col items-center space-y-4">
            <Button
              onClick={() => changeGrid(MultiGrid["1*1"])}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["1*1"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="1x1 布局"
            >
              <Square size={20}/>
            </Button>
            <Button
              onClick={() => changeGrid(MultiGrid["2*2"])}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["2*2"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="2x2 布局"
            >
              <Grid2x2 size={20}/>
            </Button>
            <Button
              onClick={() => changeGrid(MultiGrid["3*3"])}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["3*3"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="3x3 布局"
            >
              <Grid3x3 size={20}/>
            </Button>
          </div>
          <IconButton onClick={() => setIsMenuExpanded(!isMenuExpanded)}>
            {isMenuExpanded ? <ArrowLeftToLine/> : <ArrowRightFromLine/>}
          </IconButton>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderGridLayout()}
      </div>
    </div>
  );
};

export default MultiLivePage;
