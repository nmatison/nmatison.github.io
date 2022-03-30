class ZoomBubbleChartDataFormatter {
  rearrangeCSVDataForZoomBubbleChart = (csvData) => {
    const dataRearrangedByI4gRating = this.#rearrangeDataByI4gRating(csvData);
    const children = this.#createChildRelationships(dataRearrangedByI4gRating);

    return {
      name: "Cap All Data",
      children,
    };
  };

  #rearrangeDataByI4gRating = (csvData) => {
    return csvData.reduce((acc, row) => {
      const i4gDifficulty = row["i4g_difficulty"];
      const slicedMapName = row["map"].slice(7);

      const range = this.#determineCircleGroup(slicedMapName);

      if (acc[i4gDifficulty]) {
        const rowWithSlicedName = {
          ...row,
          name: slicedMapName,
          map: slicedMapName,
        };
        if (acc[i4gDifficulty][range]) {
          acc[i4gDifficulty][range].push(rowWithSlicedName);
        } else {
          acc[i4gDifficulty][range] = [rowWithSlicedName];
        }
      } else {
        acc[i4gDifficulty] = {};
      }

      return acc;
    }, {});
  };

  #determineCircleGroup = (mapName) => {
    const lowerCaseMapStartingLetter = mapName[0].toLowerCase();
    if (!/^[a-zA-Z]+$/.test(lowerCaseMapStartingLetter)) {
      return "Symbol";
    } else if (lowerCaseMapStartingLetter < "g") {
      return "A-F";
    } else if (lowerCaseMapStartingLetter < "q") {
      return "G-P";
    } else {
      return "Q-Z";
    }
  };

  #createChildRelationships = (dataRearrangedByI4gRating) => {
    const children = [];
    for (const rating in dataRearrangedByI4gRating) {
      const child = {
        name: `I4G Rating: ${rating}`,
        twitchRating: 0,
        children: [],
      };

      for (const grouping in dataRearrangedByI4gRating[rating]) {
        const grandChild = {
          name: `Maps: ${grouping}`,
          twitchRating: dataRearrangedByI4gRating[rating][grouping].length,
          children: dataRearrangedByI4gRating[rating][grouping],
        };
        child.children.push(grandChild);
      }

      child.twitchRating = child.children.length;

      children.push(child);
    }
    return children;
  };
}
