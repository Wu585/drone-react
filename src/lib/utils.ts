import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseUrl = (url: string) => {
  return url.split("/").filter((part) => {
    return part !== "";
  });
};

export const getImageUrl = (name: string) => {
  return new URL(`/src/assets/images/${name}.png`, import.meta.url).href;
};