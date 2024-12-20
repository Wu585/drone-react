import ConnectWebSocket, {MessageHandler} from "@/lib/websocket/index.ts";
import {useEffect} from "react";
import {getWebsocketUrl} from "@/lib/websocket/config.ts";

export const useConnectWebSocket = (messageHandler: MessageHandler) => {
  const webSocket = new ConnectWebSocket(getWebsocketUrl());
  useEffect(() => {
    webSocket?.registerMessageHandler(messageHandler);
    webSocket?.initSocket();

    return () => {
      webSocket?.close();
    };
  }, []);
};
