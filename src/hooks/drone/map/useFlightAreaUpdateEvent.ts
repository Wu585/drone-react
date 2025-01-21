import {EFlightAreaUpdate, FlightAreaUpdate} from "@/types/flight-area.ts";
import {useEffect} from "react";
import EventBus from "@/lib/event-bus.ts";

interface Func {
  (data: FlightAreaUpdate): void;
}

export const useFlightAreaUpdateEvent = (addFunc: Func, deleteFunc: Func, updateFunc: Func) => {

  function handleDroneLocationEvent(data: FlightAreaUpdate) {
    switch (data.operation) {
      case EFlightAreaUpdate.ADD:
        addFunc(data);
        break;
      case EFlightAreaUpdate.UPDATE:
        updateFunc(data);
        break;
      case EFlightAreaUpdate.DELETE:
        deleteFunc(data);
        break;
    }
  }

  useEffect(() => {
    EventBus.on("flightAreasUpdateWs", handleDroneLocationEvent);
    return () => {
      EventBus.off("flightAreasUpdateWs", handleDroneLocationEvent);
    };
  }, []);
};
