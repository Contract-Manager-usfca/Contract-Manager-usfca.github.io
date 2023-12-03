import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../styles/bargraph.css"; // Assuming this CSS file contains styles that you want

const MultiLineGraph = ({ averageDuration }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!averageDuration.length) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const width = 450 - margin.left - margin.right;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scalePoint()
      .range([0, width])
      .padding(0.5)
      .domain(averageDuration[0].partners.map(d => d.partner));

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(averageDuration.flatMap(d => d.partners.map(p => p.averageDuration)))]);

    // Define line generator
    const line = d3.line()
      .x(d => xScale(d.partner))
      .y(d => yScale(d.averageDuration));

    // Define color scale
    const colorScale = d3.scaleOrdinal()
      .domain(averageDuration.map(d => d.demographic))
      .range(["#C1E9FF", "#67C9FF", "#9C9FFB", "#3D7CF6"]); // These colors are from your BarGraph

    // Draw lines
    averageDuration.forEach((demo) => {
      svg.append("path")
        .datum(demo.partners)
        .attr("fill", "none")
        .attr("stroke", colorScale(demo.demographic))
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", line);
    });

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "white");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "axis") // Use this class for styling if needed
      .selectAll("text")
      .attr("fill", "white"); // Color of axis text

    // Optionally add axis labels, legends, etc.

  }, [averageDuration]); // Redraw graph when averageDuration data changes

  return <svg ref={svgRef} className="multi-line-chart"></svg>; // Use this class for styling if needed
};

export default MultiLineGraph;
