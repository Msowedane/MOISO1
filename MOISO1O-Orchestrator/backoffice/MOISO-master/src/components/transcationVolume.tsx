
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const data = [
    { month: "Sun", transactions: 1 },
    { month: "Mon", transactions: 2 },
    { month: "Tue", transactions: 3 },
    { month: "Wed", transactions: 4 },
    { month: "Thu", transactions: 5 },
    { month: "Fri", transactions: 6 },
    { month: "Sat", transactions: 7 },
];

export default function TransactionChart() {
    return (
        <div className="w-full">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-semibold text-slate-900 text-lg">
                        Transaction Volume (Last 7 Days)
                    </h1>
                    <p className="mt-2 text-md text-slate-500">
                        Daily transaction count and total volume
                    </p>
                </div>
            </div>

            <div className="h-85 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 4, left: -42, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            vertical={false}
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(value) => value.toLocaleString()}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                            formatter={(value) => [
                                Number(value).toLocaleString(),
                                "Transactions",
                            ]}
                        />

                        <Area
                            type="monotone"
                            dataKey="transactions"
                            stroke="#7c3aed"
                            strokeWidth={3}
                            fill="url(#transactionGradient)"
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
