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
      return renderStart();
      break;
  }
};

const renderStart = () => {};

const handleZoomBubbleChartSelection = (svg) => {
  svg.id = ZOOM_BUBBLE_CHART_CLASS_NAME;
  renderZoomBubbleChart();

};
