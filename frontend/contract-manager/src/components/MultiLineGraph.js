import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../styles/graph.css";

const MultiLineGraph = ({ averageDuration }) => {
  const svgRef = useRef(null);

  useEffect(() => {

    // Clear the SVG to clear graphs and re-render 
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    // if there is no data return
    if (!averageDuration.length) return;

    // const margin = { top: 30, right: 20, bottom: 0, left: 70 };
    const margin = { top: 50, right: 20, bottom: 35, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const width = 450 - margin.left - margin.right;

    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scalePoint()
      .range([0, width])
      .padding(0.8)
      .domain(averageDuration[0].partners.map(d => d.partner));

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(averageDuration.flatMap(d => d.partners.map(p => p.averageDuration)))]);

    // Define line generator
    // const line = d3.line()
    //   .x(d => xScale(d.partner))
    //   .y(d => yScale(d.averageDuration));

    // Define color scale
    const colorScale = d3.scaleOrdinal()
      .domain(averageDuration.map(d => d.demographic))
      .range(["#E41A1C", "#67C9FF", "#9C9FFB", "#3D7CF6"]);

    // Draw lines
    // averageDuration.forEach((demo) => {
    //   svg.append("path")
    //     .datum(demo.partners)
    //     .attr("fill", "none")
    //     .attr("stroke", colorScale(demo.demographic))
    //     .attr("stroke-width", 2)
    //     .attr("class", "line")
    //     .attr("d", line);
    // });

    // Draw gridlines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke-dasharray", "3, 3");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 25 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .style("text-anchor", "middle")
      .attr("fill", "white")
      .text("Average Duration (days)");

    // Select the body for the tooltip instead of the SVG
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Draw lines with updated colors and stroke-width
    averageDuration.forEach((demo) => {
      svg.append("path")
        .attr("stroke-width", 3);

      // circles for each data point
      svg.selectAll("myCircles")
        .data(demo.partners)
        .enter()
        .append("circle")
        .attr("fill", colorScale(demo.demographic))
        .attr("stroke", "none")
        .attr("cx", d => xScale(d.partner))
        .attr("cy", d => yScale(d.averageDuration))
        .attr("r", 6);
    });

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "white");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "white");

    // Draw circles for each data point and add hover functionality
    averageDuration.forEach((demo) => {
      const circles = svg.selectAll("myCircles")
        .data(demo.partners)
        .enter()
        .append("circle")
        .attr("fill", colorScale(demo.demographic))
        .attr("stroke", "none")
        .attr("cx", d => xScale(d.partner))
        .attr("cy", d => yScale(d.averageDuration))
        .attr("r", 6);

      // Hover functionality
      circles.on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("opacity", 0.7);

        // Show the tooltip on hover
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.averageDuration + " days")
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
        .on("mouseout", function (d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5)
            .attr("opacity", 1);

          // Hide the tooltip when not hovering
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });

    // Create legend
    const legend = svg.selectAll(".legend")
      .data(colorScale.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => "translate(0," + i * 22 + ")");

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colorScale);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d)
      .style("fill", "#ffffff");

  }, [averageDuration]);

  return <svg ref={svgRef} className="multi-line-chart"></svg>;
};

export default MultiLineGraph;
