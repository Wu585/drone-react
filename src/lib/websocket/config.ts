import {ELocalStorageKey} from "@/types/enum.ts";
import {CURRENT_CONFIG} from "@/lib/config.ts";

export function getWebsocketUrl () {
  const token: string = localStorage.getItem(ELocalStorageKey.Token) || '' as string
  return CURRENT_CONFIG.websocketURL + '?x-auth-token=' + encodeURI(token)
}
