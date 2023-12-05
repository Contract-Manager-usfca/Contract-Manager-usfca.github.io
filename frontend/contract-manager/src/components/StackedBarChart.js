import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../styles/graph.css";

const StackedBarChart = ({ averageDuration }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Select the SVG element and clear it
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    // Return if no data
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
      .domain(averageDuration[0].partners.map(d => d.partner));

    const yMax = d3.max(averageDuration.flatMap(demo => demo.partners.map(partner => partner.averageDuration)));
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, yMax]);

    const colorScale = d3.scaleOrdinal()
      .domain(averageDuration.map(d => d.demographic))
      .range(["#FFE601", "#00FF66", "#7D40FF", "#FF74AE"]);

    // Extract partner names and demographics for stacking
    const partnerNames = averageDuration[0].partners.map(d => d.partner);
    const demographicNames = averageDuration.map(d => d.demographic);

    // Map data to a structure suitable for D3 stack
    const stackData = partnerNames.map(partner => {
      const returnObj = { partner: partner };
      averageDuration.forEach(demo => {
        const foundPartner = demo.partners.find(p => p.partner === partner);
        returnObj[demo.demographic] = foundPartner ? foundPartner.averageDuration : 0;
      });
      return returnObj;
    });
    console.log(stackData);

    // Stack the data
    const stack = d3.stack()
      .keys(demographicNames);

    const layers = stack(stackData);

    // Draw the stacked bars
    const layerGroups = svg.selectAll(".layer")
    .data(layers)
    .enter().append("g")
    .attr("class", "layer")
    .style("fill", (d, i) => colorScale(d.key));

    layerGroups.selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => xScale(d.data.partner))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Draw the stacked bars
    svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", (d, i) => colorScale(i))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => xScale(d.data.partner))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Tooltip for hover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Hover functionality
    layerGroups.selectAll("rect")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(250).style("opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(d[1] - d[0]) // Display the segment value
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(250).style("opacity", 1);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add the X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Add the Y Axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

  }, [averageDuration]);


  return <svg ref={svgRef} className="multi-line-chart"></svg>;
};

export default StackedBarChart;
