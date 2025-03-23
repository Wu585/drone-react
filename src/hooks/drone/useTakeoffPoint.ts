import {useState, useCallback} from 'react';
import {TakeoffPoint} from '@/types/waypoint';

export const useTakeoffPoint = (viewer: any) => {
  const [takeoffPoint, setTakeoffPoint] = useState<TakeoffPoint | null>(null);

  const setPoint = useCallback((position: Position) => {
    // ... 设置起飞点的逻辑
  }, []);

  const updateTakeoffPoint = useCallback((height: number) => {
    // ... 更新起飞点高度的逻辑
  }, [takeoffPoint]);

  return {
    takeoffPoint,
    setPoint,
    updateTakeoffPoint
  };
}; 