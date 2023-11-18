import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import '../styles/bargraph.css';

const BarGraph = ({ selectedDemographics, demographicAverages }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const fetchDataAndRender = async () => {
      // Ensure that genderAverages data is available before proceeding
      if (!Object.keys(demographicAverages).length) {
        return;
      }

      const margin = { top: 20, right: 20, bottom: 30, left: 100 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      const x = d3.scaleBand().range([0, width]).padding(0.1);
      const y = d3.scaleLinear().range([height, 0]);

      const svgContainer = d3.select(svgRef.current);
      svgContainer.selectAll("*").remove();

      const updatedData = selectedDemographics.map(gender => ({ name: gender, value: demographicAverages[gender] || 0 }));

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

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 12 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text("Follower Count");

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
        .attr("y", d => y(d.value) + (height - y(d.value)) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("display", "none")
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
          .style("font-size", "16px")
          .style("font-weight", "bolder");
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
    };

    fetchDataAndRender();
  }, [selectedDemographics, demographicAverages]);

  return (
    <div className="bar-chart" ref={svgRef}></div>
  );
};

export default BarGraph;
