import {RouterProvider} from "react-router-dom";
import {router} from "./routes/router.tsx";
import "virtual:svgsprites";
import {SWRConfig} from "swr";
import {Toaster} from "@/components/ui/toaster.tsx";
import {ErrorBoundary} from "react-error-boundary";

function App() {

  return (
    <SWRConfig value={{
      refreshInterval: 5 * 60 * 1000
    }}>
      <ErrorBoundary
        fallback={
          <div className={"h-full content-center"}>页面出错了，请刷新重试！</div>
        }>
        <div className={"h-full relative font-Pingfang"}>
          <RouterProvider router={router}/>
          <Toaster/>
        </div>
      </ErrorBoundary>
    </SWRConfig>
  );
}

export default App;
