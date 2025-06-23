import {useState, useEffect, createRef, RefObject} from "react";
import {Drone, Grid2x2, Grid3x3, Logs, Package2, Square, Undo2, Video, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useDeviceTopo,} from "@/hooks/drone";
import {Link} from "react-router-dom";
import {useDeviceLive} from "@/hooks/drone/useDeviceLive.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {cn} from "@/lib/utils.ts";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";

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

const StreamItem = ({stream, onRemove}: {
  stream: LiveStream;
  onRemove: (id: string) => void
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
    <div className="bg-[#1E3557] rounded-md relative overflow-hidden">
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

  const [grid, setGrid] = useState<MultiGrid>(MultiGrid["2*2"]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const {data: dockList} = useDeviceTopo();

  useEffect(() => {
    clearDeviceState();
  }, [clearDeviceState]);

  // Add a new stream
  const addStream = (dockSn: string, droneSn: string | undefined, isDock: boolean, title: string) => {
    // Check if stream already exists
    const existingStream = streams.find(s =>
      s.dockSn === dockSn && s.isDock === isDock && (!droneSn || s.droneSn === droneSn)
    );

    if (existingStream) return;

    const newStream: LiveStream = {
      id: `${dockSn}-${isDock ? "dock" : "drone"}-${Date.now()}`,
      dockSn,
      droneSn,
      isDock,
      title,
      videoRef: createRef<HTMLVideoElement>()
    };

    setStreams(prev => [...prev, newStream]);
  };

  // Remove a stream
  const removeStream = (id: string) => {
    setStreams(prev => prev.filter(stream => stream.id !== id));
  };

  // Render grid layout with streams
  const renderGridLayout = () => {
    const gridSize = Number(grid);
    const gridTemplate = `repeat(${gridSize}, 1fr)`;

    // Fill empty slots if needed
    const totalSlots = gridSize * gridSize;
    const emptySlots = Math.max(0, totalSlots - streams.length);

    return (
      <div
        className="w-full h-full grid gap-2"
        style={{
          gridTemplateColumns: gridTemplate,
          gridTemplateRows: gridTemplate
        }}
      >
        {streams.map(stream => (
          <StreamItem
            key={stream.id}
            stream={stream}
            onRemove={removeStream}
          />
        ))}

        {Array.from({length: emptySlots}).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-[#1E3557] rounded-md flex items-center justify-center"
          >
            <span className="text-gray-500">暂无视频</span>
          </div>
        ))}
      </div>
    );
  };

  console.log("streams");
  console.log(streams);

  return (
    <div className="w-full h-full flex space-x-[16px]">
      <div className="w-[360px] bg-gradient-to-l from-[#2C4372] to-[#35537F] flex rounded-lg">
        <div className="flex-1 py-4 px-2 flex flex-col pb-8">
          <h1 className={"pb-4 pl-2"}>机场</h1>
          <div className={"flex-1 overflow-auto space-y-2"}>
            {(!dockList || dockList.length === 0) && (
              <div className={"text-center py-4 text-[#c0c0c0]"}>暂无数据</div>
            )}
            {dockList?.map(dock => (
              <div key={dock.id} className={"w-[296px] bg-multi-live-panel bg-full-size py-4 pl-8 pr-6 text-[#c0c0c0]"}>
                <div className={"flex items-center justify-between pb-2 border-b border-dashed border-gray-400"}>
                  <div className={"flex items-center"}>
                    <div
                      className={cn("w-2 h-2 rounded mr-2", deviceState.dockInfo[dock.device_sn || ""] ? "bg-[#2BE7FF]" : "bg-[#BABABA]")}></div>
                    <Package2 size={16}/>
                    <span className={"pl-2 text-sm"}>{dock.device_name} | {dock.nickname}</span>
                  </div>
                  <Button
                    className={cn("px-2 h-6", streams.find(item => item.isDock && item.dockSn === dock.device_sn) ? "bg-blue-500" : "bg-[#2A3145]/[.88]")}
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
                    <span className={"pl-2 text-sm"}>{dock.children?.device_name} | {dock.children?.nickname}</span>
                  </div>
                  <Button
                    className={cn("bg-[#52607D]/[.88] content-center rounded-[1px] h-[24px] relative",
                      streams.find(item => !item.isDock && item.droneSn === dock.children?.device_sn) ? "text-blue-400" : "text-[#c0c0c0]")}
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
        <div className="w-[43px] border-l-[1px] border-[#364E76] flex flex-col justify-between items-center pb-2">
          <div className="py-2 flex-1 flex flex-col items-center space-y-4">
            <Button
              onClick={() => {
                setGrid(MultiGrid["1*1"]);
                setStreams(streams.slice(0, 1));
              }}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["1*1"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="1x1 布局"
            >
              <Square size={20}/>
            </Button>
            <Button
              onClick={() => {
                setGrid(MultiGrid["2*2"]);
                setStreams(streams.slice(0, 4));
              }}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["2*2"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="2x2 布局"
            >
              <Grid2x2 size={20}/>
            </Button>
            <Button
              onClick={() => setGrid(MultiGrid["3*3"])}
              className={`p-2 bg-transparent rounded-md ${grid === MultiGrid["3*3"] ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
              title="3x3 布局"
            >
              <Grid3x3 size={20}/>
            </Button>
          </div>
          <Link to={"/tsa"}>
            <Undo2/>
          </Link>
        </div>
      </div>
      <div className="flex-1">
        {renderGridLayout()}
      </div>
    </div>
  );
};

export default MultiLivePage;
