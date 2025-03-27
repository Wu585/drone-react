import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import MediaDataTable from "@/components/drone/media/MediaDataTable.tsx";
import {CURRENT_CONFIG} from "@/lib/config.ts";
import {MEDIA_HTTP_PREFIX} from "@/hooks/drone";
import {ELocalStorageKey} from "@/types/enum.ts";
import {getAuthToken} from "@/lib/http.ts";
import Uploady from "@rpldy/uploady";
import {useState} from "react";

const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
const OPERATION_HTTP_PREFIX = "operation/api/v1";

const Media = () => {
  const [dirId, setDirId] = useState(0);
  const [isUploadOrder, setIsUploadOrder] = useState(false);

  return (
    <Uploady
      destination={{
        url: isUploadOrder ? `${CURRENT_CONFIG.baseURL}${OPERATION_HTTP_PREFIX}/file/upload` :
          `${CURRENT_CONFIG.baseURL}${MEDIA_HTTP_PREFIX}/files/${workspaceId}/upload?parent=${dirId}`,
        headers: {
          [ELocalStorageKey.Token]: getAuthToken()
        }
      }}
      accept="image/*,video/*"
      multiple
      autoUpload>
      <div className={"w-full h-full flex"}>
        <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
          <h1 className={"flex justify-between items-center"}>
            <div className={"py-4 px-4 flex space-x-4"}>
              <img src={titleArrowPng} alt=""/>
              <span>媒体库</span>
            </div>
          </h1>
          <div className={"flex-1 p-4"}>
            <MediaDataTable onChangeDir={(file, isOrder) => {
              setDirId(file.id);
              setIsUploadOrder(isOrder);
            }}/>
          </div>
        </div>
      </div>
    </Uploady>
  );
};

export default Media;

