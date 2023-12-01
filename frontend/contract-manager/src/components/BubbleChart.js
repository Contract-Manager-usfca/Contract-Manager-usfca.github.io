import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import axios from 'axios'; // Ensure axios is installed

const BubbleChart = () => {
  const [nodes, setNodes] = useState([]);
  const svgRef = useRef(null);

  const fetchContractData = async () => {
    try {
      const contractsResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/');
      const partnersResponse = await axios.get('https://contract-manager.aquaflare.io/partners/');

      const totalAmount = contractsResponse.data.reduce((sum, contract) => sum + contract.amount_paid, 0);
      const partnerAmounts = partnersResponse.data.map((partner, index) => ({
        id: partner.id,
        name: partner.name,
        totalAmount: contractsResponse.data
          .filter(contract => contract.partner === partner.id)
          .reduce((sum, contract) => sum + contract.amount_paid, 0),
        category: index % 3 
      }));

      const nodeData = partnerAmounts.map(partner => ({
        radius: (partner.totalAmount / totalAmount) * 100, // make the size bigger based on the percentage of contracts
        category: partner.category,
        name: partner.name
      }));

      setNodes(nodeData);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  const drawChart = () => {
    const svg = d3.select(svgRef.current)
      .attr('width', 600)
      .attr('height', 400)
      .attr("viewBox", `0 0 600 400`); // Adjust viewBox if needed

    var colorScale = ['orange', 'lightblue', '#B19CD9'];
    var xCenter = [100, 300, 500];

    var simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('x', d3.forceX().x(function(d) {
        return xCenter[d.category];
      }))
      .force('collision', d3.forceCollide().radius(function(d) {
        return d.radius;
      }))
      .on('tick', ticked);

    function ticked() {
      var u = svg.selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', function(d) {
          return d.radius;
        })
        .style('fill', function(d) {
          return colorScale[d.category];
        })
        .attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        });

        u.each(function(d) {
          console.log(`Node: ${d.name}, x: ${d.x}, y: ${d.y}`);
        });

    }

    simulation.nodes(nodes).on('tick', ticked);
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  useEffect(() => {
    drawChart();
  }, [nodes]);

  return <svg ref={svgRef}></svg>;
};

export default BubbleChart;
