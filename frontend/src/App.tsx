import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import testData from "./telemetry.json";
import "./App.css";

interface TelemetryData {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  timestamp: string;
}

function App() {
  const data: TelemetryData = testData;
  const chartData = [
    {
      name: "Current",
      cpuUsage: data.cpuUsage,
      memoryUsed: data.memoryUsed,
      memoryTotal: data.memoryTotal,
    },
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>System Telemetry Dashboard</h1>
      <p style={{ marginBottom: "20px" }}>
        Timestamp: {new Date(data.timestamp).toLocaleString()}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0 5%",
          gap: "5%",
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            background: "#27272A",
            borderRadius: "25px",
          }}
        >
          <p>CPU Usage: {data.cpuUsage}%</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpuUsage" fill="#007bff" name="CPU Usage (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            background: "#27272A",
            borderRadius: "25px",
          }}
        >
          <p>
            Memory Used: {data.memoryUsed} MB out of {data.memoryTotal} MB
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, data.memoryTotal]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="memoryUsed"
                fill="#007bff"
                name="Memory Used (MB)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
