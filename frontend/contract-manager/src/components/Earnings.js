// EarningsChart.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../styles/charts.css";

const EarningsChart = ({ contracts }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Only proceed if there are contracts to display
    if (!contracts || contracts.length === 0) return;

    const stats = calculateStatistics(contracts);
    renderChart(stats);
  }, [contracts]);

  // Function to calculate statistics like median and percentiles
  const calculateStatistics = (contracts) => {
    // Aggregate earnings by creator
    const sumsByCreator = contracts.reduce((acc, contract) => {
      if (!acc[contract.user]) acc[contract.user] = 0;
      acc[contract.user] += contract.amount_paid;
      return acc;
    }, {});

    // Sort earnings and calculate statistics
    const earningsArray = Object.values(sumsByCreator).sort((a, b) => a - b);
    const median = d3.median(earningsArray);
    const q1 = d3.quantile(earningsArray, 0.25);
    const q3 = d3.quantile(earningsArray, 0.75);
    const q9 = d3.quantile(earningsArray, 0.9);

    return { median, q1, q3, q9, earningsArray };
  };

  // Function to render the chart
  const renderChart = (data) => {
    // Clear any existing content in the SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up chart dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;


    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the X and Y scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.earningsArray.map((_, i) => i))
      .padding(0.1);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data.earningsArray)])
      .range([height, 0]);

    // Append the X and Y axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    svg.append("g")
      .call(d3.axisLeft(y));

    const colorScale = d3.scaleOrdinal()
      .range(["#9EA1FF", "#8CD5FF", "#C1E9FF", "#2E35D7"]);

    // Create the bars
    svg.selectAll(".bar")
      .data(data.earningsArray)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(i))
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d))
      .attr("fill", (d, i) => colorScale(data.earningsArray.map((_, i) => i)));

    // Append the percentile lines and labels
    const percentiles = [
      { value: data.median, label: "Median", color: "#FF5D01" },
      { value: data.q3, label: "75th Percentile", color: "#00FF19" },
      { value: data.q9, label: "90th Percentile", color: "#C10051" }
    ];

    percentiles.forEach(percentile => {
      // Append percentile line
      svg.append("line")
        .attr("class", "percentile-line") // Apply CSS class for styling
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(percentile.value))
        .attr("y2", y(percentile.value))
        .attr("stroke", percentile.color)
        .attr("stroke-dasharray", "4")
        .attr("stroke-width", "2");

      // Append text label for the percentile
      svg.append("text")
        .attr("x", width)
        .attr("y", y(percentile.value))
        .attr("dy", "-0.2em")
        .attr("dx", "-0.5em")
        .attr("text-anchor", "end")
        .attr("fill", percentile.color)
        .style("font-size", "12px")
        .text(percentile.label);
    });

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 20)
      .text("Creators");

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .text("Earnings ($)");
  };

  // Return SVG reference for the chart container
  return <div ref={svgRef} className="bar-chart"></div>;
};

export default EarningsChart;
