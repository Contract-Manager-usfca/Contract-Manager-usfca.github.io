// ORIGINAL BAR GRAPH

// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import "../styles/bargraph.css";

// const BarGraph = ({ selectedDemoCategories, demographicAverages }) => {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     const fetchDataAndRender = async () => {
//       // Ensure that genderAverages data is available before proceeding
//       if (!Object.keys(demographicAverages).length) {
//         return;
//       }

//       const margin = { top: 20, right: 20, bottom: 30, left: 100 };
//       const width = 800 - margin.left - margin.right;
//       const height = 500 - margin.top - margin.bottom;

//       const x = d3.scaleBand().range([0, width]).padding(0.1);
//       const y = d3.scaleLinear().range([height, 0]);

//       const svgContainer = d3.select(svgRef.current);
//       svgContainer.selectAll("*").remove();

//       const categories = Array.from(selectedDemoCategories);
//       const updatedData = categories.map(category => ({
//         name: category,
//         value: demographicAverages[category] || 0
//      }));

//       x.domain(updatedData.map((d) => d.name));
//       y.domain([0, d3.max(updatedData, (d) => d.value)]);

//       const svg = svgContainer
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//       x.domain(updatedData.map((d) => d.name));
//       y.domain([0, d3.max(updatedData, (d) => d.value)]);

//       svg
//         .append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(x));

//       svg
//         .append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 12 - margin.left)
//         .attr("x", 0 - height / 2)
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .attr("fill", "white")
//         .text("Follower Count");

//       const colorScale = d3
//         .scaleOrdinal()
//         .domain(updatedData.map((d) => d.name))
//         .range(["#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a"]);

//       const bars = svg
//         .selectAll(".bar")
//         .data(updatedData)
//         .enter()
//         .append("rect")
//         .attr("class", "bar")
//         .attr("x", (d) => x(d.name))
//         .attr("width", x.bandwidth())
//         .attr("y", (d) => y(d.value))
//         .attr("height", (d) => height - y(d.value))
//         .attr("fill", (d) => colorScale(d.name));

//       const labels = svg
//         .selectAll(".bar-label")
//         .data(updatedData)
//         .enter()
//         .append("text")
//         .attr("class", "bar-label")
//         .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
//         .attr("y", (d) => y(d.value) + (height - y(d.value)) / 2)
//         .attr("text-anchor", "middle")
//         .attr("fill", "white")
//         .style("display", "none")
//         .text((d) => d.value);

//       bars.on("mouseover", function (event, d) {
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .ease(d3.easeQuadInOut)
//           .attr("opacity", 0.7);

//         labels
//           .filter((labelData) => labelData === d)
//           .style("display", "block")
//           .style("font-size", "16px")
//           .style("font-weight", "bolder");
//       });

//       bars.on("mouseout", function () {
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .ease(d3.easeQuadInOut)
//           .attr("opacity", 1);

//         labels.style("display", "none");
//       });

//       svg.append("g").call(d3.axisLeft(y));
//     };

//     fetchDataAndRender();
//   }, [selectedDemoCategories, demographicAverages]);

//   return <div className="bar-chart" ref={svgRef}></div>;
// };

// export default BarGraph;

//FIRST ATTEMPT STACKED BARPLOT GRAPH

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../styles/bargraph.css';

const StackedBarGraph = ({ selectedDemoCategories, demographicAverages }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // No need to fetch data asynchronously in this case
    const renderGraph = () => {
      if (!Object.keys(demographicAverages).length) {
        return;
      }

      const margin = { top: 20, right: 20, bottom: 30, left: 100 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      // Set up scales
      const x = d3.scaleBand().range([0, width]).padding(0.1);
      const y = d3.scaleLinear().range([height, 0]);
      const svgContainer = d3.select(svgRef.current);
      svgContainer.selectAll('*').remove();

      // const categories = Array.from(selectedDemoCategories);
      // console.log("categories", categories);
      // console.log('demo averages', demographicAverages);
      // const subgroups = Object.keys(demographicAverages);
      // console.log("subgroups", subgroups); 

      const categories = Array.from(selectedDemoCategories);
      const updatedData = categories.map(category => ({
        name: category,
        value: demographicAverages[category] || 0
      }));

      // Stack the data
      const stackedData = d3.stack()
        .keys(updatedData)
        .value((d, key) => demographicAverages[d][key] || 0)(categories);

      x.domain(categories);
      y.domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))]);

      // Append the svg object to the body of the page
      const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y));

      // Color palette for subgroups
      const color = d3.scaleOrdinal()
        .domain(updatedData)
        .range(['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a']); // Use more colors for more subgroups

      // Draw the bars
      svg.append('g')
        .selectAll('g')
        .data(stackedData)
        .enter().append('g')
          .attr('fill', d => color(d.key))
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
            .attr('x', d => x(d.data.name))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth());
    };

    renderGraph();
  }, [selectedDemoCategories, demographicAverages]);

  return <div className="bar-chart" ref={svgRef}></div>;
};

export default StackedBarGraph;
