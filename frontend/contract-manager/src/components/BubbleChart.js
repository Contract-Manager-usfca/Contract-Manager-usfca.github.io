import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import axios from 'axios';

const BubbleChart = () => {
  const [nodes, setNodes] = useState([]);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  const fetchContractData = async () => {
    try {
      const contractsResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/');
      const partnersResponse = await axios.get('https://contract-manager.aquaflare.io/partners/');

      const totalAmount = contractsResponse.data.reduce((sum, contract) => sum + contract.amount_paid, 0);
      const partnerAmounts = partnersResponse.data.map(partner => ({
        id: partner.id,
        name: partner.name,
        totalAmount: contractsResponse.data
          .filter(contract => contract.partner === partner.id)
          .reduce((sum, contract) => sum + contract.amount_paid, 0),
        category: partner.id, // Assuming each partner is a separate category
      }));

      // Create a node for each contract
      const contractNodes = contractsResponse.data.map(contract => {
        const partner = partnerAmounts.find(p => p.id === contract.partner);
        return {
          id: contract.id,
          partnerName: partner ? partner.name : 'Unknown',
          amount_paid: contract.amount_paid,
          group: contract.partner,
          radius: 20, // You can also scale this based on the contract amount if desired
        };
      });

      setNodes(contractNodes);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  useEffect(() => {
    if (nodes.length > 0 && svgRef.current) {
      drawChart();
    }
  }, [nodes]);

  const drawChart = () => {
    const width = 600; // Width of the SVG container
    const height = 600; // Height of the SVG container
    const padding = 50; // Padding to ensure bubbles don't touch the SVG edges

    const svg = d3.select(svgRef.current)
    .attr('width', width)
    .attr('height', height);

  // Color scale remains the same
  const colorScale = d3.scaleOrdinal()
    .domain(nodes.map(d => d.partnerName)) // Assuming you want to color by partner name
    .range(["#C1E9FF", "#67C9FF", "#9C9FFB", "#3D7CF6"]);

  // Adjust the x scale for padding
  const x = d3.scaleBand()
    .domain(nodes.map(d => d.group))
    .range([padding, width - padding])
    .padding(0.1);

    const node = svg.append("g")
    .selectAll("circle")
    .data(nodes, d => d.id)
    .join("circle")
      .attr("r", d => d.radius)
      .attr("cx", d => x(d.group) + x.bandwidth() / 2)
      .attr("cy", d => d.y)
      .style("fill", d => colorScale(d.partnerName)) // Use the colorScale for fill color
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 4)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulationRef.current = d3.forceSimulation()
        .force("x", d3.forceX().strength(0.5).x(d => x(d.group)))
        .force("y", d3.forceY().strength(0.1).y(height / 2))
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(1))
        .force("collide", d3.forceCollide().strength(.1).radius(d => d.radius + 2).iterations(1))
        .nodes(nodes)
        .on("tick", () => {
          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });
  };
  

  // Drag event handlers
  const dragstarted = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    // Restart the simulation with a low alpha so that it cools down slowly
    simulationRef.current.alpha(0.1).restart();
  };

  

  return <svg ref={svgRef}></svg>;
};

export default BubbleChart;