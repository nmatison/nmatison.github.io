const ZOOM_BUBBLE_CHART_CLASS_NAME = "zoom-bubble-chart";

const handleChartSelectionClick = (listElement) => {
  const svg = document.querySelector(".svg");

  switch (listElement.className) {
    case "zoom-bubble-chart-item":
      return svg.id === ZOOM_BUBBLE_CHART_CLASS_NAME
        ? null
        : handleZoomBubbleChartSelection(svg);
      break;

    default:
      return svg.id === "default" ? null : renderStart(svg);
      break;
  }
};

const renderStart = (svg) => {
  svg.id = "default";

  d3.select("svg").selectAll("*").remove();
  svg.style.background = "rgb(169,169,169)";
  svg.innerHTML += `<text x="345" y="480" class="svg-default-text">Coming Soon!!! (TM)</text>`;
  clearStatsDiv()
};

const handleZoomBubbleChartSelection = (svg) => {
  svg.id = ZOOM_BUBBLE_CHART_CLASS_NAME;
  renderZoomBubbleChart();
};

function clearStatsDiv() {
  let wholeDiv = document.querySelector(".maps-info");
  wholeDiv.innerHTML = "";
  wholeDiv.innerHTML += `<img class="maps-image" src="../images/btlogo.bmp" alt="default-logo">`;
  wholeDiv.innerHTML += `<div class="maps"></div>`;
}
