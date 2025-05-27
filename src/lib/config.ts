export const CURRENT_CONFIG = {

  // license
  appId: 'Please enter the app id.', // You need to go to the development website to apply.
  appKey: 'Please enter the app key.', // You need to go to the development website to apply.
  appLicense: 'Please enter the app license.', // You need to go to the development website to apply.

  // http
  baseURL: 'http://36.152.38.220:6789/', // This url must end with "/". Example: 'http://192.168.1.1:6789/'
  websocketURL: 'http://36.152.38.220:6789/api/v1/ws', // Example: 'ws://192.168.1.1:6789/api/v1/ws'

  // livestreaming
  // RTMP  Note: This IP is the address of the streaming server. If you want to see livestream on web page, you need to convert the RTMP stream to WebRTC stream.
  rtmpURL: 'rtmp://36.152.38.220/live', // Example: 'rtmp://115.175.40.34/live/'
  rtcIp: '36.152.38.220',
  // rtmpURL: 'rtmp://221.130.54.58/live/', // Example: 'rtmp://192.168.1.1/live/'
  // GB28181 Note:If you don't know what these parameters mean, you can go to Pilot2 and select the GB28181 page in the cloud platform. Where the parameters same as these parameters.
  gbServerIp: 'Please enter the server ip.',
  gbServerPort: 'Please enter the server port.',
  gbServerId: 'Please enter the server id.',
  gbAgentId: 'Please enter the agent id',
  gbPassword: 'Please enter the agent password',
  gbAgentPort: 'Please enter the local port.',
  gbAgentChannel: 'Please enter the channel.',
  // RTSP
  rtspUserName: 'Please enter the username.',
  rtspPassword: 'Please enter the password.',
  rtspPort: '8554',
  // Agora
  agoraAPPID: '07e91bdb84714bbba89bccc474059503',
  agoraToken: '007eJxTYFj2Sc/Y5OFD9TcP3NVmLWazbUg0NOdzWDPd6RvTLu0zjUoKDAbmqZaGSSlJFibmhiZJSUmJFpZJycnJJuYmBqaWpgbGB+ZvTW8IZGQovlDNyMgAgSA+J0NKVnJGYl5eag4DAwClTiDI',
  agoraChannel: 'djchannel',

  // map
  // You can apply on the AMap website.
  amapKey: '203f02cfe2682a60627933f1595d81a8',

}
