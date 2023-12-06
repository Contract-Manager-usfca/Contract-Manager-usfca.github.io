import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { select, easeBounce } from "d3";
import "../styles/graph.css";

const StackedBarChart = ({ averageDuration }) => {
  const svgRef = useRef(null);

  console.log("average duration being given:", averageDuration);

  useEffect(() => {
    // Select the SVG element and clear it
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    if (!averageDuration.length) return;

    // Define margins, width, and height
    const margin = { top: 50, right: 20, bottom: 35, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const width = 450 - margin.left - margin.right;

    // Create an SVG canvas
    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      // x-asix representing demographic
      .domain(averageDuration.map(d => d.demographic));

    const yMax = d3.max(averageDuration, d => d3.sum(d.partners.map(p => p.averageDuration)));
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, yMax]);

    // Color scale now represents partners
    const partnerNames = averageDuration.flatMap(d => d.partners.map(p => p.partner));
    const uniquePartners = Array.from(new Set(partnerNames));

    // color scale for layers
    const colorScale = d3.scaleOrdinal()
      .domain(uniquePartners)
      .range(["#FFE601", "#00FF66", "#FF5D01", "#FF5D01"]);

    // Tooltip for hover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Function for Gridlines 
    function makeHorizontalGridlines() {
      return d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("");
    }

    // Adding Gridlines
    svg.append("g")
      .attr("class", "grid")
      .call(makeHorizontalGridlines())
      .selectAll("line")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "3,3");

    // Preparing stackData with demographics as primary category and partners as layers
    const stackData = averageDuration.map(demo => {
      const obj = { demographic: demo.demographic };
      demo.partners.forEach(partner => {
        obj[partner.partner] = partner.averageDuration;
      });
      return obj;
    });

    // Stack the data
    const stack = d3.stack()
      .keys(uniquePartners)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const layers = stack(stackData);

    // Draw the stacked bars
    svg.selectAll(".demographic")
      .data(layers)
      .enter().append("g")
      .attr("class", "demographic")
      .style("fill", (d, i) => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => xScale(d.data.demographic))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Add the X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add the Y Axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Y Axis with label 
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

    // Hover functionality
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
