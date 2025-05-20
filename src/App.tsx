import {RouterProvider} from "react-router-dom";
import {router} from "./routes/router.tsx";
import "virtual:svgsprites";
import {SWRConfig} from "swr";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useInitialConnectWebSocket} from "@/hooks/drone/useConnectWebSocket.ts";

function App() {
  useInitialConnectWebSocket();

  return (
    <SWRConfig value={{
      refreshInterval: 5 * 60 * 1000
    }}>
      <div className={"h-full relative font-Pingfang"}>
        <RouterProvider router={router}/>
        <Toaster/>
      </div>
    </SWRConfig>
  );
}

export default App;
