import {useEffect, useRef, useState} from "react";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import Panel from "@/components/travel-cloud/Panel.tsx";
import ToolBar from "@/components/toolbar/ToolBar.tsx";
import {useTravelCloudEntities} from "@/hooks/travel-cloud/entities.ts";
import {flyToView} from "@/lib/view.ts";

const TravelCloud = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();

  const [current, setCurrent] = useState({
    name: "",
    url: ""
  });

  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("travelCloudSource",
    "zdy-gy");
  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    changeSelectedEntityImage(description.id.toString());
    show();
    setCurrent({
      name: description.name,
      url: description.url
    });
  };

  useTravelCloudEntities();

  useAddLeftClickListener(panelRef, handleClickEntity, false);

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  useEffect(() => {
    flyToView(-2858920.0220572166, 4671123.623482694, 3259645.0689716875,
      5.975496162991463, -0.6714542615718049, 0.0000019680000509225692);
  }, []);

  return (
    <>
      {visible && <div ref={panelRef} className={"absolute w-[1200px] h-[800px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel title={current.name} iframeUrl={current.url} onClose={onClose}/>
      </div>
      }
      <div className={"absolute z-20 right-[50px] bottom-[32px]"}>
        <ToolBar/>
      </div>
    </>
  );
};

export default TravelCloud;

