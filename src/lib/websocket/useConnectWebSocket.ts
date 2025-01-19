import ConnectWebSocket, {MessageHandler} from "@/lib/websocket/index.ts";
import {useEffect} from "react";
import {getWebsocketUrl} from "@/lib/websocket/config.ts";

export const useConnectWebSocket = (messageHandler: MessageHandler) => {
  useEffect(() => {
    const webSocket = new ConnectWebSocket(getWebsocketUrl());

    webSocket?.registerMessageHandler(messageHandler);
    webSocket?.initSocket();

    return () => {
      webSocket?.close();
    };
  }, []);
};
