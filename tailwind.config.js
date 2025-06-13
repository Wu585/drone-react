/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    backgroundSize: {
      'auto': 'auto',
      'cover': 'cover',
      'contain': 'contain',
      '100': '100% 100%',
    },
    fontFamily: {
      fzdh: ['FZZhengHeiS-EB-GB'],
      sansCjk: ['SansCJK'],
      EER: ['EER'],
      DINAlternate: ['DINAlternate'],
      Alimama: ['Alimama'],
      NotoCJK: ['NotoCJK'],
      Pingfang: ['Pingfang'],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {height: "0"},
          to: {height: "var(--radix-accordion-content-height)"},
        },
        "accordion-up": {
          from: {height: "var(--radix-accordion-content-height)"},
          to: {height: "0"},
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'home': "url('@/assets/home/home-bg.png')",
        'zt': "url('@/assets/home/zt-bg.png')",
        'header-bg': "url('@/assets/images/header-bg.png')",
        'children-menu': "url('@/assets/images/children-menu-bg.png')",
        'header-menu-active': "url('@/assets/images/header-menu-active-bg.png')",
        'display-item-title': "url('@/assets/images/display-item-title-bg.png')",
        'add-facility': "url('@/assets/images/add-facility-bg.png')",
        'bicycle-detail-bg': "url('@/assets/images/bicycle-detail-bg.png')",
        'rwsjzs-bg': "url('@/assets/images/rwsjzs-bg.png')",
        'facilities-panel': "url('@/assets/images/facilities-panel-bg.png')",
        'facility-item': "url('@/assets/images/facility-item-bg.png')",
        'aqi': "url('@/assets/images/aqi-bg.png')",
        'wuran-item': "url('@/assets/images/wuran-item-bg.png')",
        'side-container': "url('@/assets/images/side-container-bg.png')",
        'weather': "url('@/assets/images/weather-bg.png')",
        'login': "url('@/assets/images/drone/login-bg.png')",
        'login-module': "url('@/assets/images/login-module-bg.png')",
        'rain-time': "url('@/assets/images/rain-time.png')",
        'shared-dock-header': "url('@/assets/images/shared-dock/header-bg.png')",
        'shared-dock-page': "url('@/assets/images/shared-dock/page-bg.png')",
        'top-business': "url('@/assets/images/bg-top-business.png')",
        'add-facility-icon': "url('@/assets/images/add-facility-icon-bg.png')",
        'add-facility-property': "url('@/assets/images/add-facility-property-bg.png')",
        'supplies-panel': "url('@/assets/images/supplies-panel-bg.png')",
        'hgyq-header': "url('@/assets/images/hgyq/bg-header.png')",
        'hgyq-header-menu-active': "url('@/assets/images/hgyq/bg-menu-active.png')",
        'login-panel': "url('@/assets/images/drone/login-panel-bg.png')",
        'center': "url('@/assets/images/hgyq/bg-center.png')",
        'drone-system': "url('@/assets/images/drone/bg-drone.png')",
        'dock-panel': "url('@/assets/images/drone/bg-dock-panel.png')",
        'control-panel': "url('@/assets/images/drone/bg-control-panel.png')",
        'take-off-panel': "url('@/assets/images/drone/bg-take-off-panel.png')",
        'take-off-panel-header': "url('@/assets/images/drone/bg-take-off-panel-header.png')",
        'cockpit': "url('@/assets/images/drone/cockpit/bg-cockpit.png')",
        'break': "url('@/assets/images/drone/cockpit/bg-break.png')",
        'cockpit-header': "url('@/assets/images/drone/cockpit/bg-header.png')",
        'degrees-group': "url('@/assets/images/drone/cockpit/bg-degrees-group.png')",
        'center-video': "url('@/assets/images/drone/cockpit/bg-center-video.png')",
        'cockpit-keyboard': "url('@/assets/images/drone/cockpit/bg-keyboard.png')",
        'cockpit-button': "url('@/assets/images/drone/cockpit/bg-button.png')",
        'dock-video': "url('@/assets/images/drone/cockpit/bg-dock-video.png')",
        'cockpit-workorder': "url('@/assets/images/drone/cockpit/bg-workorder.png')",
        'compass-around': "url('@/assets/images/drone/cockpit/bg-compass-around.png')",
        'fly-params': "url('@/assets/images/drone/cockpit/bg-fly-params.png')",
        'device': "url('@/assets/images/drone/bg-device.png')",
        'device-active': "url('@/assets/images/drone/bg-device-active.png')",
        'panel-item': "url('@/assets/images/drone/bg-panel-item.png')",
        'screen-header': "url('@/assets/images/drone/screen/header-bg.png')",
        'screen-full': "url('@/assets/images/drone/screen/full-bg.png')",
        'screen-content': "url('@/assets/images/drone/screen/content-bg.png')",
        'screen-title': "url('@/assets/images/drone/screen/title-bg.png')",
        'screen-flight-statis': "url('@/assets/images/drone/screen/flight-statis-bg.png')",
        'screen-select': "url('@/assets/images/drone/screen/select-bg.png')",
        'screen-task-detail': "url('@/assets/images/drone/screen/task-detail-bg.png')",
        'screen-media-content': "url('@/assets/images/drone/screen/media-content-bg.png')",
        'screen-work-order': "url('@/assets/images/drone/screen/work-order-bg.png')",
        'compass-drone': "url('@/assets/images/drone/drone.png')",
        'algorithm-panel': "url('@/assets/images/drone/algorithm/panel-bg.png')",
        'algorithm-jjgj': "url('@/assets/images/drone/algorithm/jjgj.png')",
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({addUtilities}) {
      addUtilities({
        '.content-center': {
          'display': "flex",
          'justify-content': 'center',
          'align-items': 'center',
        },
        '.bg-full-size': {
          'backgroundSize': "100% 100%",
        },
      })
    })
  ],
}
