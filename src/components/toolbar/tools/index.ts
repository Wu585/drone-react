import {calcDistance, clearCalcDistance} from "@/components/toolbar/tools/calcDistance.ts";
import {calcArea, clearCalcArea} from "@/components/toolbar/tools/calcArea.ts";
import {calcHeight, clearHeight} from "@/components/toolbar/tools/calcHeight.ts";
import {clearFrameSelectionQuery, frameSelectionQuery} from "@/components/toolbar/tools/frameSelectionQuery.ts";
import {analyseView, clearAnalyseView} from "@/components/toolbar/tools/analyseView.ts";
import {analyseSightLine, clearAnalyseSightLine} from "@/components/toolbar/tools/analyseSightLine.ts";
import {analyseShadow, clearAnalyseShadow} from "@/components/toolbar/tools/analyseShadow.ts";
import {clearPickPosition, pickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {clearCircle} from "@/components/toolbar/tools/drawCircle.ts";

const clearAll = () => {
  clearCalcDistance();
  clearCalcArea();
  clearHeight();
  clearFrameSelectionQuery();
  clearAnalyseView();
  clearAnalyseSightLine();
  clearAnalyseShadow();
  clearPickPosition();
  clearCircle();
};

export {
  pickPosition,
  calcDistance,
  calcArea,
  calcHeight,
  frameSelectionQuery,
  analyseView,
  analyseSightLine,
  analyseShadow,
  clearAll
};
