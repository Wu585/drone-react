import {CSSProperties, FC, MouseEvent, SVGProps} from "react";
import {cn} from "@/lib/utils.ts";

interface Props extends SVGProps<any> {
  className?: string;
  name: string;
  onClick?: (e: MouseEvent) => void;
  style?: CSSProperties;
}

export const Icon: FC<Props> = ({name, className, onClick, ...rest}) => {
  return (
    <svg className={cn("j-icon", className)} onClick={onClick} {...rest}>
      <use xlinkHref={`#${name}`}></use>
    </svg>
  );
};
