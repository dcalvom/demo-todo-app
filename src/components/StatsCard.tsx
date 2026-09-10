interface StatsCardProps {
  label: string;
  value: number;
  color?: "blue" | "yellow" | "green" | "red" | "gray";
}

const COLOR_MAP = {
  blue: "text-blue-600 bg-blue-50",
  yellow: "text-yellow-600 bg-yellow-50",
  green: "text-green-600 bg-green-50",
  red: "text-red-600 bg-red-50",
  gray: "text-gray-600 bg-gray-50",
};

export default function StatsCard({
  label,
  value,
  color = "blue",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div
        className={`text-2xl font-bold mb-1 ${COLOR_MAP[color].split(" ")[0]}`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
