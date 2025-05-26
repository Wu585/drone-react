import {useSceneStore} from "@/store/useSceneStore.ts";
import {useEffect, useMemo, useRef} from "react";
import {UranusMqtt} from "@/mqt";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";

const DRC_API_PREFIX = "/control/api/v1";

export const useConnectMqtt = (connect: boolean = true) => {
  const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";
  const {osdVisible, setMqttState, setClientId} = useSceneStore();
  const {post} = useAjax();
  const mqttStateRef = useRef<UranusMqtt | null>(null);

  const dockOsdVisible = useMemo(() => osdVisible && osdVisible.visible && osdVisible.is_dock, [osdVisible]);

  useEffect(() => {
    if (dockOsdVisible || connect) {
      if (mqttStateRef.current) return;

      post(`${DRC_API_PREFIX}/workspaces/${workspaceId}/drc/connect`, {}).then((result: any) => {
        if (result.data.code === 0) {
          const {address, client_id, username, password} = result.data.data;
          mqttStateRef.current = new UranusMqtt(address, {
            clientId: client_id,
            username,
            password,
          });
          mqttStateRef.current?.initMqtt();
          setMqttState(mqttStateRef.current);
          setClientId(client_id);
        }
      });
    }

    if (mqttStateRef.current) {
      mqttStateRef.current.destroyed();
      mqttStateRef.current = null;
      setMqttState(null);
      setClientId("");
    }
  }, [dockOsdVisible, connect, workspaceId]);

  return () => {
    mqttStateRef.current?.destroyed();
  };
};
