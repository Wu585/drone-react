import {RouterProvider} from "react-router-dom";
import {router} from "./routes/router.tsx";
import "virtual:svgsprites";
import FitScreen from "@fit-screen/react";
import {SWRConfig} from "swr";
import {Toaster} from "@/components/ui/toaster.tsx";

function App() {
  return (
    <SWRConfig value={{
      refreshInterval: 5 * 60 * 1000
    }}>
      <FitScreen width={1920} height={1080} mode="full">
        <div className={"h-full relative"}>
          <RouterProvider router={router}/>
          <Toaster />
        </div>
      </FitScreen>
    </SWRConfig>
  );
}

export default App;
