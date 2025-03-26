export function getMediaType(url: string): "image" | "video" | "unknown" {
  const imageExtensions: string[] = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"];
  const videoExtensions: string[] = [".mp4", ".avi", ".mkv", ".mov", ".flv", ".wmv"];

  const extension = url.split(".").pop()?.split("?")[0].toLowerCase() || "";

  if (imageExtensions.includes(`.${extension}`)) {
    return "image";
  } else if (videoExtensions.includes(`.${extension}`)) {
    return "video";
  } else {
    return "unknown";
  }
}
