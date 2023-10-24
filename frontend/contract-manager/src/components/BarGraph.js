import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import '../styles/BarGraph.css';

const BarGraph = ({ selectedDemographics }) => { 

  // TEST DATA 
  // const [data, setData] = useState([
  //   { name: "A", value: 50 },
  //   { name: "B", value: 20 },
  //   { name: "C", value: 40 },
  //   { name: "D", value: 70 },
  // ]);

  // CURRENTLY THE DATA THE GRAPH IS PRODUCING DOESN'T MAKE SENSE
  // need to grab data, group users, add them within their groups, and display

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const svgContainer = d3.select(".bar-chart");
    svgContainer.selectAll("*").remove();

    // Update the data whenever selectedDemographics changes
    //CURRENTLY USING DEMOGRAPHICS BUT ALSO A RANDOM NUMBER 
    const updatedData = selectedDemographics.map(demo => ({ name: demo, value: Math.random() * 100 }));

    x.domain(updatedData.map(d => d.name));
    y.domain([0, d3.max(updatedData, d => d.value)]);

    const svg = svgContainer
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(updatedData.map(d => d.name));
    y.domain([0, d3.max(updatedData, d => d.value)]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    const colorScale = d3.scaleOrdinal()
      .domain(updatedData.map(d => d.name))
      .range(["#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a"]);

    const bars = svg
      .selectAll(".bar")
      .data(updatedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .attr("fill", d => colorScale(d.name));

    const labels = svg
      .selectAll(".bar-label")
      .data(updatedData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) + (height - y(d.value)) / 2) // Position in the middle of the bar
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("display", "none") // Initially set to hidden
      .text(d => d.value);

    bars.on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .ease(d3.easeQuadInOut)
        .attr("opacity", 0.7);

      labels
        .filter(labelData => labelData === d)
        .style("display", "block")
        .style("font-size", "16px") // Increase font size on hover
        .style("font-weight", "bolder"); // Increase font weight on hover
    });

    bars.on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .ease(d3.easeQuadInOut)
        .attr("opacity", 1);

      labels.style("display", "none");
    });

    svg.append("g").call(d3.axisLeft(y));
  }, [selectedDemographics]);

  return <div className="bar-chart"></div>;
};

export default BarGraph;

