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
import "./App.css";

interface TelemetryData {
  cpuUsage: number;
  memoryAvailable: number;
  memoryTotal: number;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("/telemetry.json")
        .then((response) => {
          if (!response.ok) throw new Error("Fetch failed");
          return response.json();
        })
        .then((jsonData) => {
          setData({
            ...jsonData,
            memoryAvailable: (jsonData.memoryAvailable / 1024 / 1024).toFixed(
              1,
            ),
            memoryTotal: (jsonData.memoryTotal / 1024 / 1024).toFixed(1),
          });
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Loading...</p>;

  const chartData = [
    {
      name: "Current",
      cpuUsage: data.cpuUsage,
      memoryAvailable: data.memoryAvailable,
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
            Memory Available: {data.memoryAvailable} GB out of{" "}
            {data.memoryTotal} GB
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, data.memoryTotal * 1]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="memoryAvailable"
                fill="#007bff"
                name="Memory Available (GB)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
