class DataFormatter {
  rearrangeCSVDataForZoomBubbleChart = (csvData) => {
    const dataRearrangedByI4gRating = csvData.reduce((acc, row) => {
      const i4gDifficulty = row["i4g_difficulty"];
      const slicedMapName = row["map"].slice(7);

      const loweredMapName = slicedMapName[0].toLowerCase();

      let range = "";

      if (!/^[a-zA-Z]+$/.test(loweredMapName)) {
        range = "Symbol";
      } else if (loweredMapName < "g") {
        range = "A-F";
      } else if (loweredMapName < "q") {
        range = "G-P";
      } else {
        range = "Q-Z";
      }
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

    const dataForD3Hierarchy = {
      name: "Cap All Data",
      children,
    };

    return dataForD3Hierarchy;
  };
}
