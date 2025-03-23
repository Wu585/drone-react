interface WaypointContextMenuProps {
  waypoints: WayPoint[];
  selectedWaypointId: number | null;
  onAddWaypoint: (afterId: number) => void;
}

export const WaypointContextMenu = ({
  waypoints,
  selectedWaypointId,
  onAddWaypoint
}: WaypointContextMenuProps) => {
  return (
    <RightClickPanel>
      {waypoints.length === 0 ? (
        <MenuItem onClick={() => onAddWaypoint(0)}>
          新增航点
        </MenuItem>
      ) : selectedWaypointId ? (
        <>
          <MenuItem onClick={() => onAddWaypoint(0)}>
            在最前添加航点
          </MenuItem>
          <MenuItem onClick={() => onAddWaypoint(selectedWaypointId - 1)}>
            在 {selectedWaypointId} 号航点前添加航点
          </MenuItem>
          <MenuItem onClick={() => onAddWaypoint(selectedWaypointId)}>
            在 {selectedWaypointId} 号航点后添加航点
          </MenuItem>
          <MenuItem onClick={() => onAddWaypoint(waypoints.length)}>
            在最后添加航点
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => onAddWaypoint(0)}>
            在最前添加航点
          </MenuItem>
          <MenuItem onClick={() => onAddWaypoint(waypoints.length)}>
            在最后添加航点
          </MenuItem>
        </>
      )}
    </RightClickPanel>
  );
}; 