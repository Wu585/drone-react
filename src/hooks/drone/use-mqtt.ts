import {IPublishPacket} from "mqtt";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {IClientPublishOptions} from "mqtt";
import EventBus from "@/lib/event-bus.ts";
import {DRC_METHOD} from "@/types/drc.ts";
import {useEffect, useRef, useState} from "react";

export interface DeviceTopicInfo {
  sn: string;
  pubTopic: string;
  subTopic: string;
}

type MessageMqtt = (topic: string, payload: Buffer, packet: IPublishPacket) => void | Promise<void>

export const useMqtt = (deviceTopicInfo: DeviceTopicInfo) => {
  let cacheSubscribeArr: {
    topic: string;
    callback?: MessageMqtt;
  }[] = [];

  const {mqttState} = useSceneStore();

  const publishMqtt = (topic: string, body: object, ots?: IClientPublishOptions) => {
    mqttState?.publishMqtt(topic, JSON.stringify(body), ots);
  };

  const onMessageMqtt = (message: any) => {
    if (cacheSubscribeArr.findIndex(item => item.topic === message?.topic) !== -1) {
      const payloadStr = new TextDecoder("utf-8").decode(message?.payload);
      const payloadObj = JSON.parse(payloadStr);
      switch (payloadObj?.method) {
        case DRC_METHOD.HEART_BEAT:
          break;
        case DRC_METHOD.DELAY_TIME_INFO_PUSH:
        case DRC_METHOD.HSI_INFO_PUSH:
        case DRC_METHOD.OSD_INFO_PUSH:
        case DRC_METHOD.DRONE_CONTROL:
        case DRC_METHOD.DRONE_EMERGENCY_STOP:
          EventBus.emit("droneControlMqttInfo", payloadObj);
          break;
        default:
          break;
      }
    }
  };

  const subscribeMqtt = (topic: string, handleMessageMqtt?: MessageMqtt) => {
    mqttState.subscribeMqtt(topic);
    const handler = handleMessageMqtt || onMessageMqtt;
    mqttState?.on("onMessageMqtt", handler);
    cacheSubscribeArr.push({
      topic,
      callback: handler,
    });
  };

  const unsubscribeDrc = () => {
    // 销毁已订阅事件
    cacheSubscribeArr.forEach(item => {
      mqttState?.off("onMessageMqtt", item.callback);
      mqttState?.unsubscribeMqtt(item.topic);
    });
    cacheSubscribeArr = [];
  };

  const [heartBeatSeq, setHeartBeatSeq] = useState(0);
  const heartState = useRef(new Map());

  const publishDrcPing = (sn: string) => {
    const body = {
      method: DRC_METHOD.HEART_BEAT,
      data: {
        ts: new Date().getTime(),
        seq: heartBeatSeq,
      },
    };

    const pingInterval = setInterval(() => {
      if (!mqttState) return;
      setHeartBeatSeq(heartBeatSeq + 1);
      body.data.ts = new Date().getTime();
      body.data.seq = heartBeatSeq;
      publishMqtt(deviceTopicInfo.pubTopic, body, {qos: 0});
    }, 1000);

    heartState.current.set(sn, {
      pingInterval
    });
  };

  useEffect(() => {
    if (deviceTopicInfo.subTopic !== "") {
      // 1. 订阅 topic
      subscribeMqtt(deviceTopicInfo.subTopic);
      // 2. 发心跳
      publishDrcPing(deviceTopicInfo.sn);
    } else {
      // 如果 subTopic 为空，清理状态
      const existingState = heartState.current.get(deviceTopicInfo.sn);
      if (existingState) {
        clearInterval(existingState.pingInterval);
        heartState.current.delete(deviceTopicInfo.sn);
        setHeartBeatSeq(0);
      }
    }
  }, [deviceTopicInfo]);

  useEffect(() => {
    return () => {
      unsubscribeDrc();
      setHeartBeatSeq(0);
    };
  }, []);

  return {
    mqttState,
    publishMqtt,
    subscribeMqtt,
  };
};
