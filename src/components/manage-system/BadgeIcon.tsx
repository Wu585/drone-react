import {Bell} from "lucide-react";

const BadgeIcon = ({count}: { count: number }) => {
  return (
    <div className="relative inline-block">
      <Bell className="text-2xl"/>
      {count > 0 && (
        <span
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs">
          {count}
        </span>
      )}
    </div>
  );
};

export default BadgeIcon;
