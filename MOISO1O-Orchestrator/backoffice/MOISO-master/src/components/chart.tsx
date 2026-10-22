
import {
    Pie,
    PieChart,
    Sector,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { PieSectorShapeProps, TooltipIndex } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const data = [
    { name: "India", value: 51 },
    { name: "London", value: 34 },
    { name: "USA", value: 15 },
    { name: "Canada", value: 10 },
];

const PieGradient = (props: PieSectorShapeProps) => {
    const color = COLORS[(props.index ?? 0) % COLORS.length];
    const index = props.index ?? 0;

    return (
        <>
            <defs>
                <radialGradient
                    id={`fillGradient${index}`}
                    cx={props.cx}
                    cy={props.cy}
                    r={props.outerRadius}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                </radialGradient>
            </defs>

            <Sector
                {...props}
                fill={`url(#fillGradient${index})`}
                stroke={color}
                strokeWidth={props.isActive ? 3 : 1}
            />
        </>
    );
};

type PieWithGradientProps = {
    isAnimationActive?: boolean;
    defaultIndex?: TooltipIndex;
};

export default function PieWithGradient({
    isAnimationActive = true,
    defaultIndex,
}: PieWithGradientProps) {
    return (
        <div className="w-full">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
                Top Destination Countries
            </h2>
            <p className="text-slate-500">
                Transaction distribution by corridor
            </p>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="85%"
                            innerRadius="45%"
                            paddingAngle={3}
                            isAnimationActive={isAnimationActive}
                            shape={PieGradient}
                        />

                        <Tooltip defaultIndex={defaultIndex} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                        <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-slate-600">{item.name}</span>
                        <span className="ml-auto font-medium text-slate-900">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div >
    );
}
