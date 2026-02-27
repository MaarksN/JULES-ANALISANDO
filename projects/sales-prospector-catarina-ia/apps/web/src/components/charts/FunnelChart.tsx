import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Leads", value: 400 },
  { name: "Contacted", value: 300 },
  { name: "Qualified", value: 200 },
  { name: "Closed", value: 100 },
];

export const FunnelChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="vertical">
      <XAxis type="number" hide />
      <YAxis dataKey="name" type="category" width={100} />
      <Tooltip />
      <Bar
        dataKey="value"
        fill="#8884d8"
        barSize={20}
        radius={[0, 10, 10, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);
