import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import axios from 'axios';
import "../styles/charts.css";

const BubbleChart = () => {
  const [nodes, setNodes] = useState([]);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  const defaultWidth = 450;
  const defaultHeight = 350;
  const defaultRatio = defaultWidth / defaultHeight;

  const margin = { top: 20, right: 20, bottom: 10, left: 40 };

  // Determine font size for the legend based on chart width
  const getLegendFontSize = (width) => {
    const baseFontSize = 2;
    const scaleFactor = 0.02;
    return Math.max(baseFontSize, baseFontSize * scaleFactor * width);
  };

  // Determine legend box size based on chart width
  const getLegendBoxSize = (width) => {
    const baseSize = 2.5; // Base size for the legend boxes
    const scaleFactor = 0.02; // Adjust this factor based on your design
    return Math.max(baseSize, baseSize * scaleFactor * width);
  };

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
    const handleResize = () => {
      if (nodes.length > 0 && svgRef.current) {
        const { width, height } = set_size();
        drawChart(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [nodes]);

  const set_size = () => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    const currentRatio = currentWidth / currentHeight;

    let w, h;
    if (currentRatio > defaultRatio) {
      h = defaultHeight;
      w = defaultWidth;
    } else {
      margin.left = 20;
      w = currentWidth - 190;
      h = w / defaultRatio;
    }

    return {
      width: w - margin.left - margin.right,
      height: h - margin.top - margin.bottom
    };
  };

  const drawChart = (width, height) => {
    const fontSize = getLegendFontSize(width);
    const boxSize = getLegendBoxSize(width);
    const padding = 30; // Padding to ensure bubbles don't touch the SVG edges

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // used in order to rerender
    svg.selectAll("*").remove();

    // Color scale remains the same
    const colorScale = d3.scaleOrdinal()
      .domain(nodes.map(d => d.partnerName)) // Assuming you want to color by partner name
      .range(["#FF5D01", "#FFE601", "#00FF66", "#7D40FF"]);

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
      .style("fill", d => colorScale(d.partnerName))
      .style("fill-opacity", 0.8)
      .attr("stroke", "#1D1D1D")
      .style("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulationRef.current = d3.forceSimulation()
      .force("x", d3.forceX().strength(0.5).x(d => x(d.group)))
      .force("y", d3.forceY().strength(0.1).y(height / 2))
      .force("center", d3.forceCenter().x(width / 2.3).y(height / 2))
      .force("charge", d3.forceManyBody().strength(1))
      .force("collide", d3.forceCollide().strength(.1).radius(d => d.radius + 2).iterations(1))
      .nodes(nodes)
      .on("tick", () => {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });

    // // Labels for each partner
    const partnerLabels = Array.from(new Set(nodes.map(d => d.partnerName)));

    const labelGroups = svg.append("g")
      .attr("class", "label-groups")
      .selectAll("g")
      .data(partnerLabels)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${x(nodes.find(n => n.partnerName === d).group) + x.bandwidth() / 2 - 10}, ${height - 40})`);

    // Add color rectangles for each label
    labelGroups.append("rect")
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("x", -22)
      .attr("y", -9)
      .style("fill", d => colorScale(d));

    // Add text labels next to the rectangles
    labelGroups.append("text")
      .attr("x", 4)
      .attr("y", 5)
      .text(d => d)
      .attr("class", "partner-label")
      .style("text-anchor", "start")
      .style("fill", "#ffffff")
      .style("font-size", `${fontSize}px`);
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



  return <svg ref={svgRef} className="bubble-chart"></svg>;
};

export default BubbleChart;
