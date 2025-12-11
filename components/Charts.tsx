import React, { useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as d3 from 'd3';
import { Lead } from '../types';

interface ChartsProps {
  leads: Lead[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#3b82f6'];

export const IndustryChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const ind = l.industry || 'Unknown';
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [leads]);

  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <h3 className="text-slate-400 text-sm font-semibold mb-2 text-center">Top Industries</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
           <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
           <XAxis type="number" stroke="#94a3b8" hide />
           <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 12}} />
           <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#a855f7' }}
              cursor={{fill: '#334155', opacity: 0.4}}
           />
           <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
           </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const KeywordBubbleChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!leads.length || !svgRef.current) return;

    // Simple keyword extraction for visualization
    const text = leads.map(l => l.context).join(" ").toLowerCase();
    const words = text.match(/\b\w{4,}\b/g) || [];
    const counts: Record<string, number> = {};
    words.forEach(w => {
        if(!['this', 'that', 'with', 'from', 'have', 'need', 'looking'].includes(w))
            counts[w] = (counts[w] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    const width = 300;
    const height = 250;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(data as any)
      .force("charge", d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => (d.value * 5) + 5));

    const nodes = svg.selectAll("g")
      .data(data)
      .enter()
      .append("g");

    const circles = nodes.append("circle")
      .attr("r", (d: any) => Math.min(d.value * 6 + 10, 40))
      .attr("fill", (d, i) => COLORS[i % COLORS.length])
      .attr("opacity", 0.7);

    nodes.append("text")
      .text((d: any) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("fill", "white")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [leads]);

  return (
    <div className="flex flex-col items-center">
        <h3 className="text-slate-400 text-sm font-semibold mb-2">Context Keywords</h3>
        <svg ref={svgRef} width={300} height={250} className="overflow-visible" />
    </div>
  );
};
