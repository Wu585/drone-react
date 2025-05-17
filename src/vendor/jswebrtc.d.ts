declare module '@/vendor/jswebrtc.min.js' {
  interface JSWebrtcUrlParams {
    url: string;
    schema: string;
    server: string;
    port: number;
    vhost: string;
    app: string;
    stream: string;
    user_query: Record<string, string>;
    [key: string]: any;
  }

  interface PlayerOptions {
    video: HTMLVideoElement;
    autoplay?: boolean;
    poster?: string;
    decodeFirstFrame?: boolean;
    streaming?: boolean;
    onPlay?: (player: any) => void;
    onPause?: (player: any) => void;
    [key: string]: any;
  }

  class Player {
    constructor(url: string, options: PlayerOptions);
    options: PlayerOptions;
    urlParams: JSWebrtcUrlParams;
    pc: RTCPeerConnection | null;
    autoplay: boolean;
    paused: boolean;
    isPlaying: boolean;
    animationId: number | null;
    play(): void;
    pause(): void;
    stop(): void;
    destroy(): void;
    startLoading(): void;
  }

  class VideoElement {
    constructor(element: HTMLElement);
    container: HTMLElement;
    video: HTMLVideoElement;
    playButton: HTMLDivElement;
    player: Player;
    onUnlockAudio(element: HTMLElement, ev: Event): void;
    onClick(ev: Event): void;
    posterLoaded(): void;
  }

  interface JSWebrtc {
    Player: typeof Player;
    VideoElement: typeof VideoElement;
    CreateVideoElements(): void;
    FillQuery(query_string: string, obj: any): void;
    ParseUrl(rtmp_url: string): JSWebrtcUrlParams;
    HttpPost(url: string, data: string): Promise<any>;
  }

  const JSWebrtc: JSWebrtc;
  export default JSWebrtc;
}
