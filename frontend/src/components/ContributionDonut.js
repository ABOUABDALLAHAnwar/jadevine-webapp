import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#A28CF0',
  '#FF6B6B',
  '#3D9970',
];

export default function ContributionDonut({ data }) {
  const chartData = Object.entries(data || {})
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return <p className="text-gray-500 text-center">Aucune contribution</p>;
  }

  return (
    <div className="w-full flex justify-center">
      <PieChart width={180} height={180}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          label={({ value }) => `${(value * 100).toFixed(0)}%`}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
      </PieChart>
    </div>
  );
}
