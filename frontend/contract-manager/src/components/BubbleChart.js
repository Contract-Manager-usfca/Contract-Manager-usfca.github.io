import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import axios from 'axios';

const BubbleChart = () => {
  const [nodes, setNodes] = useState([]);
  const svgRef = useRef();

  const fetchContractData = async () => {
    try {
      const contractsResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/');
      const partnersResponse = await axios.get('https://contract-manager.aquaflare.io/partners/');
      
      // Calculate the total amount paid in all contracts
      const totalAmount = contractsResponse.data.reduce((sum, contract) => sum + contract.amount_paid, 0);
      
      // Map the partnersResponse to a new array that includes a totalAmount per partner
      const partnerAmounts = partnersResponse.data.map(partner => {
        const totalAmountForPartner = contractsResponse.data
          .filter(contract => contract.partner === partner.id)
          .reduce((sum, contract) => sum + contract.amount_paid, 0);

        return {
          id: partner.id,
          name: partner.name,
          totalAmount: totalAmountForPartner,
          group: partner.id, // Assuming each partner is a separate group
          radius: (totalAmountForPartner / totalAmount) * 100 // Radius proportional to the percentage of total amount
        };
      });

      setNodes(partnerAmounts); // Set the nodes for the D3 chart
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      drawChart();
    }
  }, [nodes]);

  const drawChart = () => {
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // A color scale: one color for each group
    const color = d3.scaleOrdinal()
      .domain(nodes.map(d => d.group))
      .range(d3.schemeCategory10);

    // A scale that gives a X target position for each group
    const x = d3.scaleOrdinal()
      .domain(nodes.map(d => d.group))
      .range([50, width / 2, width - 50]);

    // Initialize the circles: all located at the center of the svg area
    const node = svg.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
        .attr("r", d => d.radius)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", d => color(d.group))
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 4);

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("x", d3.forceX().strength(0.5).x(d => x(d.group)))
        .force("y", d3.forceY().strength(0.1).y(height / 2))
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.1).radius(d => d.radius + 2).iterations(1)); // Force that avoids circle overlapping

    simulation
      .nodes(nodes)
      .on("tick", () => {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
  };

  // Set the dimensions of the graph
  const width = 450;
  const height = 450;

  return <svg ref={svgRef}></svg>;
};

export default BubbleChart;
