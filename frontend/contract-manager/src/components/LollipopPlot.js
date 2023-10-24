import React, { useEffect } from "react";
import * as d3 from "d3";
import '../styles/BarGraph.css';

const LollipopGraph = ({ selectedDemographics }) => { 

    useEffect(() => {
        const margin = { top: 20, right: 20, bottom: 30, left: 100 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const circleRadius = 5;

        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([0, height]).padding(0.1);

        const svgContainer = d3.select(".lollipop-chart");
        svgContainer.selectAll("*").remove();

        const updatedData = selectedDemographics.map(demo => ({ name: demo, value: Math.random() * 100 }));

        x.domain([0, d3.max(updatedData, d => d.value)]);
        y.domain(updatedData.map(d => d.name));

        const svg = svgContainer
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const colorScale = d3.scaleOrdinal()
          .domain(updatedData.map(d => d.name))
          .range(["#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a"]);

        // Drawing lines for the lollipop plot
        const lines = svg.selectAll(".line")
            .data(updatedData)
            .enter()
            .append("line")
            .attr("class", "line")
            .attr("y1", d => y(d.name) + y.bandwidth() / 2) // Adjusted this line
            .attr("y2", d => y(d.name) + y.bandwidth() / 2) // Adjusted this line
            .attr("x1", 0) // Start x-position
            .attr("x2", d => x(d.value)) // End x-position
            .attr("stroke", d => colorScale(d.name));

        // Drawing circles for the lollipop plot
        const circles = svg.selectAll(".circle")
            .data(updatedData)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cy", d => y(d.name) + y.bandwidth() / 2) // Adjusted this line
            .attr("cx", d => x(d.value)) // Horizontal position
            .attr("r", circleRadius) // Radius
            .attr("fill", d => colorScale(d.name));

        // Adjusted the label positioning
        const labels = svg
          .selectAll(".label")
          .data(updatedData)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x", d => x(d.value))
          .attr("y", d => y(d.name) + y.bandwidth() / 2 - 10)  // 10px above the circle and adjusted for centering
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("display", "none")
          .text(d => d.value);

        circles.on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .ease(d3.easeQuadInOut)
                .attr("r", 8)
                .attr("opacity", 0.7);

            labels
                .filter(labelData => labelData === d)
                .style("display", "block");
        });

        circles.on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .ease(d3.easeQuadInOut)
                .attr("r", 5)
                .attr("opacity", 1);

            labels.style("display", "none");
        });

        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
        
        svg.append("g").call(d3.axisLeft(y));

    }, [selectedDemographics]);

    return <div className="lollipop-chart"></div>;
};

export default LollipopGraph;
