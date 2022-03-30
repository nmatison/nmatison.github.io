class DataFormatter {
    static rearrangeCSVDataForZoomBubbleChart  = (csvData) => {

        const dataRearrangedByI4gRating = csvData.reduce((acc, row) => {
          const i4gDifficulty = row["i4g_difficulty"];
          const slicedMapName = row["map"].slice(7)
      
          const loweredMapName = slicedMapName[0].toLowerCase()
      
          let range = ''
      
          if (!/^[a-zA-Z]+$/.test(loweredMapName)) {
            range = 'Symbol'
          } else if (loweredMapName < 'g') {
            range = 'A-F'
          } else if (loweredMapName < 'q') {
            range = 'G-P'
          }else {
            range = 'Q-Z'
          }
            if (acc[i4gDifficulty]) {
              const rowWithSlicedName = {...row, name: slicedMapName, map: slicedMapName}
              if (acc[i4gDifficulty][range]) {
                acc[i4gDifficulty][range].push(rowWithSlicedName);
              } else {
                acc[i4gDifficulty][range] = [rowWithSlicedName]
              }
              
            } else {
              acc[i4gDifficulty] = {}
            }
      
            return acc;
        }, {})
      
        const children = []
      
        for (const rating in dataRearrangedByI4gRating) {
          const child = {
            name: `I4G Rating: ${rating}`,
            twitch_rating: 0,
            children: []
          }
      
          // need a twitch_rating per group. Sum of children length
          for (const grouping in dataRearrangedByI4gRating[rating]) {
            const grand_child = {
              name: `Maps: ${grouping}`,
              twitch_rating: dataRearrangedByI4gRating[rating][grouping].length,
              children: dataRearrangedByI4gRating[rating][grouping]
            }
            child.children.push(grand_child)
          }
      
          // Need a twitch_rating per child
      
          // child.twitch_rating = child.children.reduce((acc, group) => {
          //   return acc + group.children.length
          // }, 0)
      
          child.twitch_rating = child.children.length
      
          children.push(child)
        }
      
        const dataForD3Hierarchy = {
          name: "Cap All Data",
          children
        };
      
        return dataForD3Hierarchy
      }
      
}
