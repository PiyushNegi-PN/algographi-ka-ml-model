import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VisualizationData } from '../utils/gemini';

interface AlgorithmVisualizerProps {
  data: VisualizationData;
  currentStep: number;
}

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ data, currentStep }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400; // Increased height for linked list visualization
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    svg.attr("width", width).attr("height", height);

    // Handle different data types
    if (data.type === 'array') {
      renderArrayVisualization(svg, data.data as number[], width, height, margin, currentStep);
    } else if (data.type === 'graph') {
      renderGraphVisualization(svg, data.data, width, height, margin, currentStep);
    } else if (data.type === 'tree') {
      renderTreeVisualization(svg, data.data, width, height, margin, currentStep);
    } else if (data.type === 'linkedlist') {
      renderLinkedListVisualization(svg, data.data, width, height, margin, currentStep);
    } else {
      // Fallback: try to detect data structure automatically
      console.log('Data type not recognized, attempting auto-detection:', data);
      if (
        data.data &&
        typeof data.data === 'object' &&
        !Array.isArray(data.data) &&
        'nodes' in (data.data as Record<string, unknown>)
      ) {
        renderLinkedListVisualization(svg, data.data, width, height, margin, currentStep);
      } else if (Array.isArray(data.data)) {
        renderArrayVisualization(svg, data.data as number[], width, height, margin, currentStep);
      }
    }
  }, [data, currentStep, animationSpeed]);

  const renderArrayVisualization = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    array: number[],
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number },
    step: number
  ) => {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .domain(array.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(array) || 1])
      .range([innerHeight, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create array elements with enhanced properties
    const elements = array.map((value, index) => ({
      value,
      index,
      x: xScale(index.toString()) || 0,
      y: yScale(value),
      width: xScale.bandwidth(),
      height: innerHeight - yScale(value)
    }));

    // Remove existing bars first to prevent override
    g.selectAll(".bar").remove();
    
    // Add bars with interactive styling
    const bars = g.selectAll(".bar")
      .data(elements)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => d.x)
      .attr("width", d => d.width)
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", (_, i) => {
        if (i === step) return "var(--current-color)";
        if (i < step) return "var(--checked-color)";
        return "var(--unchecked-color)";
      })
      .attr("stroke", (_, i) => i === step ? "var(--ai-color)" : "var(--stroke-color)")
      .attr("stroke-width", (_, i) => i === step ? 4 : 2)
      .attr("rx", 5)
      .attr("ry", 5)
      .on("click", (_, d) => {
        console.log(`Clicked element at index ${d.index} with value ${d.value}`);
      })
      .on("mouseover", function() {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke-width", 3);
      })
      .on("mouseout", function(_, d) {
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke-width", d.index === step ? 4 : 2);
      });

    // Animate bars with smooth transitions
    bars.transition()
      .duration(animationSpeed)
      .ease(d3.easeCubicInOut)
      .attr("y", d => d.y)
      .attr("height", d => d.height)
      .attr("fill", (_, i) => {
        if (i === step) return "var(--current-color)";
        if (i < step) return "var(--checked-color)";
        return "var(--unchecked-color)";
      })
      .attr("stroke", (_, i) => i === step ? "var(--ai-color)" : "var(--stroke-color)")
      .attr("stroke-width", (_, i) => i === step ? 4 : 2);

    // Add value labels - remove existing ones first to prevent override
    g.selectAll(".value-label").remove();
    const valueLabels = g.selectAll(".value-label")
      .data(elements)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => d.x + d.width / 2)
      .attr("y", innerHeight + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "var(--text-color)")
      .text(d => d.value);

    // Animate value labels
    valueLabels.transition()
      .duration(animationSpeed)
      .ease(d3.easeCubicInOut)
      .attr("y", innerHeight + 20);

    // Add index labels - remove existing ones first to prevent override
    g.selectAll(".index-label").remove();
    const indexLabels = g.selectAll(".index-label")
      .data(elements)
      .enter()
      .append("text")
      .attr("class", "index-label")
      .attr("x", d => d.x + d.width / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "var(--text-color)")
      .text(d => d.index);

    // Animate index labels
    indexLabels.transition()
      .duration(animationSpeed)
      .ease(d3.easeCubicInOut)
      .attr("y", innerHeight + 35);

    // Remove existing axis first to prevent override
    g.selectAll(".axis").remove();
    
    // Add axis
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "12px");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("font-size", "12px");
  };

  const renderGraphVisualization = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    graphData: any,
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number },
    step: number
  ) => {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing elements
    svg.selectAll("*").remove();

    // Parse graph data - handle both array and adjacency list formats
    let nodes: any[] = [];
    let edges: any[] = [];
    
    if (Array.isArray(graphData)) {
      // Simple array format: ['A', 'B', 'C', 'D']
      nodes = graphData.map((id: string) => ({ id }));
      // Create sequential edges
      for (let i = 0; i < graphData.length - 1; i++) {
        edges.push({ source: graphData[i], target: graphData[i + 1] });
      }
    } else if (typeof graphData === 'object' && graphData !== null) {
      // Adjacency list format: {nodeA: [0,1], nodeB: [1,2]}
      const nodeNames = Object.keys(graphData);
      nodes = nodeNames.map((name: string) => ({ id: name }));
      
      // Create edges from adjacency list
      nodeNames.forEach((nodeName: string) => {
        const neighbors = graphData[nodeName] || [];
        neighbors.forEach((neighborName: string) => {
          if (nodeNames.includes(neighborName)) {
            edges.push({ 
              source: nodeName, 
              target: neighborName
            });
          }
        });
      });
    }

    if (nodes.length === 0) return;

    const container = svg.append("g").attr("class", "graph-container-group");

    // Zoom support (exactly like BFSGraphVisualizer)
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 1])
      .on("zoom", (event) => container.attr("transform", event.transform));
    svg.call(zoom as any);

    // Position nodes in circle (exactly like BFSGraphVisualizer)
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      node.x = innerWidth / 2 + 120 * Math.cos(angle);
      node.y = innerHeight / 2 + 120 * Math.sin(angle);
    });

    // Create force simulation (exactly like BFSGraphVisualizer)
    const simulation = d3
      .forceSimulation(nodes as any)
      .alpha(1)
      .alphaDecay(0.9)
      .velocityDecay(0.2)
      .force("link", d3.forceLink(edges as any).id((d: any) => d.id).distance(160))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force("collision", d3.forceCollide(50));

    // Create links (exactly like BFSGraphVisualizer)
    container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke-width", 2)
      .attr("stroke", "#999");

    // Create nodes (exactly like BFSGraphVisualizer)
    const node = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        // Step-based coloring (like BFSGraphVisualizer)
        if (step === 0) return "#3b82f6";
        if (d.visited) return "#10b981";
        if (d.current) return "#f59e0b";
        return "#6b7280";
      })
      .attr("stroke", (d) => {
        if (d.current) return "#f59e0b";
        return "#fff";
      })
      .attr("stroke-width", (d) => {
        if (d.current) return 6;
        return 3;
      })
      .on("click", (event, d) => {
        if (event.defaultPrevented) return;
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.currentTarget)
          .transition()
          .duration(500)
          .attr("transform", "translate(0, -20)")
          .transition()
          .duration(500)
          .attr("transform", "translate(0, 0)")
          .on("end", () => {
            d.fx = null;
            d.fy = null;
          });
      })
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Create labels (exactly like BFSGraphVisualizer)
    container
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d: any) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "#fff")
      .style("font-weight", "bold");

    // Tooltips with algorithm details (like BFSGraphVisualizer)
    node.append("title").text((d: any) => {
      return `${d.id}\nVisited: ${d.visited ? "Yes✅" : "No❌"}\nNeighbors: ${d.neighbors ? d.neighbors.join(', ') : 'None'}`;
    });

    // Tick update (exactly like BFSGraphVisualizer)
    simulation.on("tick", () => {
      d3.select(svg.node())
        .selectAll<SVGLineElement, any>(".links line")
        .attr("x1", (d) => (d.source as any).x!)
        .attr("y1", (d) => (d.source as any).y!)
        .attr("x2", (d) => (d.target as any).x!)
        .attr("y2", (d) => (d.target as any).y!);

      d3.select(svg.node())
        .selectAll<SVGCircleElement, any>(".nodes circle")
        .attr("cx", (d) => d.x!)
        .attr("cy", (d) => d.y!);

      d3.select(svg.node())
        .selectAll<SVGTextElement, any>(".labels text")
        .attr("x", (d) => d.x!)
        .attr("y", (d) => d.y!);
    });

    // Add step information (like BFSGraphVisualizer)
    container.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("fill", "var(--text-color)")
      .text(`Step ${step + 1} | Nodes: ${nodes.length} | Edges: ${edges.length}`);
  };

  const renderLinkedListVisualization = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    listData: any,
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number },
    step: number
  ) => {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing elements
    svg.selectAll("*").remove();

    if (!listData || !listData.nodes) {
      console.log('Linked list data missing:', listData);
      return;
    }

    console.log('Rendering linked list with data:', listData);

    const nodes = listData.nodes;
    const connections = listData.connections || [];
    const head = listData.head;
    const tail = listData.tail;
    const isCircular = connections.some((conn: any) => 
      conn.from === tail && conn.to === head
    );

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate node positions (horizontal layout)
    const nodeSpacing = innerWidth / (nodes.length + 1);
    const nodePositions = nodes.map((node: any, index: number) => ({
      ...node,
      x: (index + 1) * nodeSpacing,
      y: innerHeight / 2
    }));

    // Create node groups
    const nodeGroups = g.selectAll(".linkedlist-node")
      .data(nodePositions)
      .enter()
      .append("g")
      .attr("class", "linkedlist-node")
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    // Draw node rectangles (like array boxes)
    nodeGroups.append("rect")
      .attr("class", "node-box")
      .attr("x", -35)
      .attr("y", -25)
      .attr("width", 70)
      .attr("height", 50)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (_, i) => {
        if (i === step) return "#f59e0b"; // Current node - orange
        if (i < step) return "#10b981"; // Visited nodes - green
        return "#3b82f6"; // Unvisited nodes - blue
      })
      .attr("stroke", (_, i) => {
        if (i === step) return "#f59e0b";
        return "#1e40af";
      })
      .attr("stroke-width", (_, i) => i === step ? 4 : 2)
      .attr("opacity", 0.9);

    // Draw inner box for data section
    nodeGroups.append("rect")
      .attr("class", "data-box")
      .attr("x", -30)
      .attr("y", -20)
      .attr("width", 40)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "white")
      .attr("stroke", "#666")
      .attr("stroke-width", 1);

    // Draw pointer section
    nodeGroups.append("rect")
      .attr("class", "pointer-box")
      .attr("x", 15)
      .attr("y", -20)
      .attr("width", 30)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "#f8f9fa")
      .attr("stroke", "#666")
      .attr("stroke-width", 1);

    // Draw "Data" label
    nodeGroups.append("text")
      .attr("class", "data-label")
      .attr("x", -10)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .text("Data");

    // Draw node values in data section
    nodeGroups.append("text")
      .attr("class", "node-value")
      .attr("x", -10)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d: any) => d.value);

    // Draw "Next" label for pointer
    nodeGroups.append("text")
      .attr("class", "next-label")
      .attr("x", 30)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .text("Next");

    // Draw node IDs in pointer section
    nodeGroups.append("text")
      .attr("class", "node-id")
      .attr("x", 30)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-size", "10px")
      .text((d: any) => d.id);

    // Draw arrows for connections
    connections.forEach((conn: any) => {
      const fromNode = nodePositions.find((n: any) => n.id === conn.from);
      const toNode = nodePositions.find((n: any) => n.id === conn.to);
      
      if (fromNode && toNode) {
        // Calculate arrow positions (from pointer section to next node)
        const startX = fromNode.x + 30; // From pointer section
        const startY = fromNode.y;
        const endX = toNode.x - 35; // To left edge of next node
        const endY = toNode.y;

        // Draw arrow line
        g.append("line")
          .attr("class", "linkedlist-arrow")
          .attr("x1", startX)
          .attr("y1", startY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "#666")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");

        // Draw arrowhead marker
        const defs = g.append("defs");
        defs.append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 8)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "#666");
      }
    });

    // Draw head pointer
    if (head) {
      const headNode = nodePositions.find((n: any) => n.id === head);
      if (headNode) {
        g.append("text")
          .attr("class", "head-pointer")
          .attr("x", headNode.x)
          .attr("y", headNode.y - 40)
          .attr("text-anchor", "middle")
          .attr("fill", "#ef4444")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text("HEAD");

        // Draw arrow from head pointer to first node
        g.append("line")
          .attr("class", "head-arrow")
          .attr("x1", headNode.x)
          .attr("y1", headNode.y - 30)
          .attr("x2", headNode.x)
          .attr("y2", headNode.y - 20)
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#head-arrow)");

        // Head arrow marker
        const defs = g.append("defs");
        defs.append("marker")
          .attr("id", "head-arrow")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 8)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "#ef4444");
      }
    }

    // Draw tail pointer (for doubly linked list)
    if (tail) {
      const tailNode = nodePositions.find((n: any) => n.id === tail);
      if (tailNode) {
        g.append("text")
          .attr("class", "tail-pointer")
          .attr("x", tailNode.x)
          .attr("y", tailNode.y + 50)
          .attr("text-anchor", "middle")
          .attr("fill", "#8b5cf6")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text("TAIL");
      }
    }

    // Add array representation below linked list
    const arrayStartY = innerHeight / 2 + 80;
    const arrayBoxWidth = 50;
    const arrayBoxHeight = 30;
    const arraySpacing = 60;

    // Draw array representation title
    g.append("text")
      .attr("class", "array-title")
      .attr("x", innerWidth / 2)
      .attr("y", arrayStartY - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text("Array Representation");

    // Draw array boxes
    nodePositions.forEach((node: any, index: number) => {
      const arrayX = (index + 1) * arraySpacing - 25;
      
      // Array box
      g.append("rect")
        .attr("class", "array-box")
        .attr("x", arrayX)
        .attr("y", arrayStartY)
        .attr("width", arrayBoxWidth)
        .attr("height", arrayBoxHeight)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", (_, i) => {
          if (i === step) return "#f59e0b"; // Current - orange
          if (i < step) return "#10b981"; // Visited - green
          return "#3b82f6"; // Unvisited - blue
        })
        .attr("stroke", (_, i) => {
          if (i === step) return "#f59e0b";
          return "#1e40af";
        })
        .attr("stroke-width", (_, i) => i === step ? 3 : 2);

      // Array index
      g.append("text")
        .attr("class", "array-index")
        .attr("x", arrayX + arrayBoxWidth / 2)
        .attr("y", arrayStartY - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#666")
        .text(`[${index}]`);

      // Array value
      g.append("text")
        .attr("class", "array-value")
        .attr("x", arrayX + arrayBoxWidth / 2)
        .attr("y", arrayStartY + arrayBoxHeight / 2 + 3)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(node.value);

      // Memory address (simulated)
      g.append("text")
        .attr("class", "memory-address")
        .attr("x", arrayX + arrayBoxWidth / 2)
        .attr("y", arrayStartY + arrayBoxHeight + 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#666")
        .text(`0x${(1000 + index * 8).toString(16).toUpperCase()}`);
    });

    // Draw connections between linked list and array
    nodePositions.forEach((node: any, index: number) => {
      const linkedListY = innerHeight / 2;
      const arrayY = arrayStartY + arrayBoxHeight / 2;
      
      // Dotted line connecting linked list node to array element
      g.append("line")
        .attr("class", "connection-line")
        .attr("x1", node.x)
        .attr("y1", linkedListY + 25)
        .attr("x2", (index + 1) * arraySpacing)
        .attr("y2", arrayY)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    });

    // Add step information
    g.append("text")
      .attr("class", "step-info")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("fill", "var(--text-color)")
      .text(`Step ${step + 1} | ${listData.meta?.algorithm || 'Linked List'} | Nodes: ${nodes.length}`);

    // Add circular indicator
    if (isCircular) {
      g.append("text")
        .attr("class", "circular-indicator")
        .attr("x", innerWidth - 10)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "#f59e0b")
        .attr("font-weight", "bold")
        .text("🔄 Circular");
    }
  };

  const renderTreeVisualization = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    treeData: any[],
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number },
    _step: number
  ) => {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Simple binary tree visualization
    const nodes = treeData.map((value, index) => ({
      value,
      x: (index + 1) * (innerWidth / (treeData.length + 1)),
      y: innerHeight / 2
    }));

    // Draw nodes
    g.selectAll(".tree-node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "tree-node")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 20)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#1e40af")
      .attr("stroke-width", 2);

    // Draw labels
    g.selectAll(".tree-label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "tree-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .text(d => d.value);
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Visualization
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Processed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-600">Pending</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Animation Speed:</label>
          <input
            type="range"
            min="200"
            max="2000"
            step="200"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-500">{animationSpeed}ms</span>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-gray-50">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: '400px', border: '1px solid #e5e7eb' }}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p><strong>Current Step:</strong> {currentStep + 1} of {data.data.length}</p>
        <p><strong>Data Type:</strong> {data.type}</p>
        <p><strong>Elements:</strong> {data.data.length}</p>
        <p><strong>Current Element:</strong> {data.data[currentStep] || 'N/A'}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-1 px-2 py-1 rounded text-xs ${
            currentStep === 0 ? 'bg-blue-100 text-blue-800' :
            currentStep < data.data.length - 1 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {currentStep === 0 ? 'Starting' :
             currentStep < data.data.length - 1 ? 'In Progress' :
             'Completed'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;


