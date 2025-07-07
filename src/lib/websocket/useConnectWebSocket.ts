import ConnectWebSocket, {MessageHandler} from "@/lib/websocket/index.ts";
import {useEffect, useMemo} from "react";
import {getWebsocketUrl} from "@/lib/websocket/config.ts";

export const useConnectWebSocket = (messageHandler: MessageHandler) => {
  const url = useMemo(() => getWebsocketUrl(), []); // 避免 url 变化导致重连

  useEffect(() => {
    const webSocket = new ConnectWebSocket(url);
    webSocket.registerMessageHandler(messageHandler); // 先注册回调
    webSocket.initSocket(); // 后初始化连接

    return () => {
      // 仅在连接已建立时关闭
      if (webSocket._socket?.readyState === WebSocket.OPEN) {
        webSocket.close();
      }
    };
  }, []);
};
