const BOTTOM_OF_TREE_DEPTH = 2;

var svg = d3.select("svg"),
  margin = 5,
  diameter = 960,
  g = svg
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3
  .scaleLinear()
  .domain([-1, 5])
  .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
  .interpolate(d3.interpolateHcl);

var pack = d3
  .pack()
  .size([diameter - margin, diameter - margin])
  .padding(2);

// TODO - Fetch the data from supa's server directly instead of a hardcoded file on my end if/when I feel like spinning up a backend server.
d3.csv("/data/caps_hard_copy.csv", function (error, csvData) {
  if (error) throw error;

  zoomBubbleChartDataFormatter = new ZoomBubbleChartDataFormatter();

  data =
    zoomBubbleChartDataFormatter.rearrangeCSVDataForZoomBubbleChart(csvData);

  root = d3
    .hierarchy(data)
    .sum(function (d) {
      return 5 + 25 * parseFloat(d.twitch_rating);
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  var focus = root,
    nodes = pack(root).descendants(),
    view;

  populateCollectionStats(root.data);

  var circle = g
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return d.parent ? (d.children ? "node" : "leaf") : "node node--root";
    })
    .style("fill", function (d) {
      return d.children ? color(d.depth) : null;
    })
    .on("click", function (d) {
      if (focus !== d) zoom(d), d3.event.stopPropagation();
    });

  svg.selectAll(".leaf").on("mouseover", null).on("click", null);

  svg.selectAll(".node").on("mouseover", function (d) {
    updateStatsForCollection(d.data);
  });

  g.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) {
      return d.parent === root ? 1 : 0;
    })
    .style("display", function (d) {
      return d.parent === root ? "inline" : "none";
    })
    .text(function (d) {
      return d.data.name;
    });

  var node = g.selectAll("circle,text");

  svg.style("background", color(-1)).on("click", function () {
    zoom(root);
  });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus;
    focus = d;

    var transition = d3
      .transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween("zoom", function (d) {
        var i = d3.interpolateZoom(view, [
          focus.x,
          focus.y,
          focus.r * 2 + margin,
        ]);
        return function (t) {
          zoomTo(i(t));
        };
      });

    transition
      .selectAll("text")
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .style("fill-opacity", function (d) {
        return d.parent === focus ? 1 : 0;
      })
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });

    if (d.depth === BOTTOM_OF_TREE_DEPTH) {
      svg.selectAll(".leaf").on("mouseover", function (d) {
        updateStatsForMap(d.data);
      });
      svg.selectAll(".node").on("mouseover", null);
    } else {
      svg.selectAll(".leaf").on("mouseover", null);
      svg.selectAll(".node").on("mouseover", function (d) {
        updateStatsForCollection(d.data);
      });
    }
  }

  function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
      return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
      return d.r * k;
    });
  }

  function populateCollectionStats(collectionData) {
    collectionData.children.forEach((i4g_rating_circle) => {
      const i4gRatingCollectionStats = {
        total_twitch_ratings: 0,
        average_twitch_rating: 0,
        total_maps_capped: 0,
        parent_name: collectionData.name,
      };

      i4g_rating_circle.children.forEach((map_group_circle) => {
        const mapGroupCollectionStats = {
          total_twitch_ratings: 0,
          average_twitch_rating: 0,
          total_maps_capped: 0,
          parent_name: i4g_rating_circle.name,
        };

        map_group_circle.children.forEach((map_circle) => {
          mapGroupCollectionStats.total_twitch_ratings += parseFloat(
            map_circle.twitch_rating
          );
          mapGroupCollectionStats.total_maps_capped += 1;
        });

        mapGroupCollectionStats.average_twitch_rating = (
          mapGroupCollectionStats.total_twitch_ratings /
          mapGroupCollectionStats.total_maps_capped
        ).toFixed(2);
        map_group_circle.collectionStats = mapGroupCollectionStats;

        i4gRatingCollectionStats.total_twitch_ratings +=
          mapGroupCollectionStats.total_twitch_ratings;
        i4gRatingCollectionStats.total_maps_capped +=
          mapGroupCollectionStats.total_maps_capped;
      });

      i4gRatingCollectionStats.average_twitch_rating = (
        i4gRatingCollectionStats.total_twitch_ratings /
        i4gRatingCollectionStats.total_maps_capped
      ).toFixed(2);
      i4g_rating_circle.collectionStats = i4gRatingCollectionStats;
    });
  }

  function updateStatsForCollection(collectionData) {
    clearStatsDiv();

    let div = document.querySelector(".maps");
    div.innerHTML = "";
    div.innerHTML += "<h1>Collection Set:</h1>";
    div.innerHTML += `<p>${collectionData.name}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Parent Collection Set:</h1>";
    div.innerHTML += `<p>${collectionData.collectionStats.parent_name}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Amount Of Maps Capped</h1>";
    div.innerHTML += `<p>${collectionData.collectionStats.total_maps_capped}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Average Twitch Rating</h1>";
    div.innerHTML += `<p>${collectionData.collectionStats.average_twitch_rating}</p>`;
  }

  function updateStatsForMap(capData) {
    clearStatsDiv();
    let div = document.querySelector(".maps");
    div.innerHTML = "";
    div.innerHTML += "<h1>Map:</h1>";
    div.innerHTML += `<p>${capData.map}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Author:</h1>";
    div.innerHTML += `<p>${capData.map_author}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>I4G Difficulty:</h1>";
    div.innerHTML += `<p>${capData.i4g_difficulty}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Twitch Chat Rating:</h1>";
    div.innerHTML += `<p>${capData.twitch_rating}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Date Capped:</h1>";
    div.innerHTML += `<p>${capData.time_capped}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Cap Number:</h1>";
    div.innerHTML += `<p>${capData.cap_number}</p>`;
    div.innerHTML += `<br>`;
    div.innerHTML += "<h1>Time Taken To Cap:</h1>";
    div.innerHTML += `<p>${capData.time_played}</p>`;
  }

  function clearStatsDiv() {
    let wholeDiv = document.querySelector(".maps-info");
    wholeDiv.innerHTML = "";
    wholeDiv.innerHTML += `<img class="maps-image" src="./images/btlogo.bmp" alt="default-logo">`;
    wholeDiv.innerHTML += `<div class="maps"></div>`;
  }
});
