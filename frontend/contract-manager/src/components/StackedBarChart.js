import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { select, easeBounce } from "d3";
import "../styles/charts.css";

// StackedBarChart component that takes in calculated average contract duration
const StackedBarChart = ({ averageDuration }) => {
  // Reference to the SVG container for D3 manipulation
  const svgRef = useRef(null);

  useEffect(() => {
    // D3 selections and SVG container setup
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    // Ensuring averageDuration data is available before proceeding
    if (!averageDuration.length) return;

    // Margin and dimensions setup for the chart
    const margin = { top: 50, right: 20, bottom: 35, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const width = 450 - margin.left - margin.right;

    // Create an SVG canvas
    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Defining scales for the x-axis (band scale) and y-axis (linear scale)
    const xScale = d3.scaleBand()
      .range([0, width])
      .padding(0.3)
      .domain(averageDuration.map(d => d.demographic));

    const yMax = d3.max(averageDuration, d => d3.sum(d.partners.map(p => p.averageDuration)));
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, yMax]);

    // Mapping data to grab partnerNames
    const partnerNames = averageDuration.flatMap(d => d.partners.map(p => p.partner));
    const uniquePartners = Array.from(new Set(partnerNames));

    // Setting color scale for layers
    const colorScale = d3.scaleOrdinal()
      .domain(uniquePartners)
      .range(["#FFE601", "#00FF66", "#7D40FF", "#FF74AE"]);

    // Tooltip for hover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Function to add Gridlines
    function gridLines() {
      return d3.axisLeft(yScale)
        .ticks(5)
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

    // Preparing stackData with demographics as primary category and partners as layers
    const stackData = averageDuration.map(demo => {
      const obj = { demographic: demo.demographic };
      demo.partners.forEach(partner => {
        obj[partner.partner] = partner.averageDuration;
      });
      return obj;
    });

    // Stacking the data
    const stack = d3.stack()
      .keys(uniquePartners)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const layers = stack(stackData);

    // Rendering stacked bars based on given data
    svg.selectAll(".demographic")
      .data(layers)
      .enter().append("g")
      .attr("class", "demographic")
      .style("fill", (d, i) => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.data.demographic))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Adding x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Adding y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Adding y-axis label 
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "axis-label")
      .attr("y", 40 - margin.left)
      .attr("x", -height / 2)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("Average Duration");

    // Determineing position for the legend
    const legendX = margin.right + 20;
    const legendY = -30;

    // Rendering legend for clarity
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Starting position for the first legend item
    let xOffset = 0;

    // Grabbing each partner name and corresponding color representation
    colorScale.domain().forEach((partner, index) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${xOffset}, 0)`);

      legendItem.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(partner));

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text(partner)
        .attr("class", "legend-text")
        .style("font-size", "14px")
        .attr("fill", "#ffffff");

      // Update xOffset for the next legend item
      const textWidth = legendItem.select("text").node().getComputedTextLength();
      xOffset += textWidth + 34;
    });

    // Adjust the height of the SVG to accommodate the legend
    svg.attr("height", height + margin.top + margin.bottom + 20);

    // hover functionality to display values
    svg.selectAll(".demographic rect")
      .on("mouseover", function (event, d) {
        select(this)
          .transition()
          .duration(250)
          .ease(easeBounce)
          .attr("opacity", 0.7);

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d[1] - d[0]} days`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        select(this)
          .transition()
          .duration(200)
          .ease(easeBounce)
          .attr("opacity", 1);

        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

  }, [averageDuration]);


  return <svg ref={svgRef} className="multi-line-chart"></svg>;
};

export default StackedBarChart;
