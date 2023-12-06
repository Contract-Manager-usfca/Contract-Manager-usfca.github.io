import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { select, easeBounce } from "d3";
import "../styles/graph.css";

const BarGraph = ({ selectedDemoCategories, demographicAverages }) => {
  const svgRef = useRef(null);

  const drawChart = () => {
    // Ensure that genderAverages data is available before proceeding
    if (!Object.keys(demographicAverages).length) {
      return;
    }

    const svgContainer = d3.select(svgRef.current);

    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const width = 450 - margin.left - margin.right;

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    svgContainer.selectAll("*").remove();

    const categories = Array.from(selectedDemoCategories);
    const updatedData = categories.map(category => ({
      name: category,
      value: demographicAverages[category] || 0
    }));

    x.domain(updatedData.map((d) => d.name));
    y.domain([0, d3.max(updatedData, (d) => d.value)]);

    const svg = svgContainer
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Function for Gridlines
    function gridLines() {
      return d3.axisLeft(y)
        .ticks(updatedData.length)
        .tickSize(-width)
        .tickFormat("");
    }

    // Adding Gridlines
    svg.append("g")
      .attr("class", "grid")
      .call(gridLines())
      .selectAll("line")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "4,4");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    const colorScale = d3.scaleOrdinal()
      .domain(updatedData.map((d) => d.name))
      .range(["#FFE601", "#00FF66", "#7D40FF", "#FF74AE"]);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 18 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .style("text-anchor", "middle")
      .attr("fill", "white")
      .text("Follower Count");

    // Tooltip for hover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const bars = svg.selectAll(".bar")
      .data(updatedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => colorScale(d.name));

    bars.on("mouseover", function (event, d) {
      select(this)
        .transition()
        .duration(250)
        .ease(easeBounce)
        .attr("opacity", 0.7);

      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.value} followers`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    });

    bars.on("mouseout", function () {
      select(this)
        .transition()
        .duration(200)
        .ease(easeBounce)
        .attr("opacity", 1);

      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

    svg.append("g").call(d3.axisLeft(y));
  };

  useEffect(() => {
    drawChart();

    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedDemoCategories, demographicAverages]);

  return <div className="bar-chart" ref={svgRef}></div>;
};

export default BarGraph;