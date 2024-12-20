import useSWR from "swr";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {useAjax} from "@/lib/http.ts";
import {ELocalStorageKey} from "@/types/enum.ts";
import {useEffect, useState} from "react";
import {EDeviceTypeName, EModeCode, OnlineDevice} from "@/hooks/drone/device.ts";

export const useDeviceTopo = (workspace_id: string) => {
  const {get} = useAjax();
  const url = `${HTTP_PREFIX}/devices/${workspace_id}/devices`;
  return useSWR(url, async (path) => (await get<Resource<any[]>>(path)).data.data);
};

export const useOnlineDocks = () => {
  const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!;
  const {data: deviceTopo} = useDeviceTopo(workspaceId);
  const [onlineDocks, setOnlineDocks] = useState<OnlineDevice[]>([]);

  useEffect(() => {
    if (!deviceTopo) return;

    const deviceList: OnlineDevice[] = deviceTopo.map((gateway: any) => {
      const child = gateway.children;
      return {
        model: child?.device_name,
        callsign: child?.nickname,
        sn: child?.device_sn,
        mode: EModeCode.Disconnected,
        gateway: {
          model: gateway?.device_name,
          callsign: gateway?.nickname,
          sn: gateway?.device_sn,
          domain: gateway?.domain
        },
        payload: child?.payloads_list.map((payload: any) => ({
          index: payload.index,
          model: payload.model,
          payload_name: payload.payload_name,
          payload_sn: payload.payload_sn,
          control_source: payload.control_source,
          payload_index: payload.payload_index
        }))
      };
    }).filter((gateway: any) => gateway.gateway.domain === EDeviceTypeName.Dock);

    setOnlineDocks(deviceList);
  }, [deviceTopo]);

  return {onlineDocks};
};
