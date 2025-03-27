export function getMediaType(url: string): "image" | "video" | "unknown" {
  try {
    // 1. 尝试从 response-content-type 参数获取类型
    const urlObj = new URL(url);
    const contentType = urlObj.searchParams.get('response-content-type');
    if (contentType) {
      if (contentType.startsWith('video/')) {
        return 'video';
      }
      if (contentType.startsWith('image/')) {
        return 'image';
      }
    }

    // 2. 从文件名判断
    // 从 response-content-disposition 或 URL 路径获取文件名
    const disposition = urlObj.searchParams.get('response-content-disposition');
    let filename = '';
    if (disposition) {
      const match = disposition.match(/filename=(.*?)(?:$|&|;)/);
      if (match) {
        filename = match[1];
      }
    }
    
    // 如果没有从 disposition 获取到文件名，从路径获取
    if (!filename) {
      filename = url.split('/').pop()?.split('?')[0] || '';
    }

    // 检查文件扩展名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv', '.webm'];
    
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (ext) {
      if (imageExtensions.includes(ext)) {
        return 'image';
      }
      if (videoExtensions.includes(ext)) {
        return 'video';
      }
    }

    return 'unknown';
  } catch (e) {
    console.error('Error parsing media URL:', e);
    return 'unknown';
  }
}
