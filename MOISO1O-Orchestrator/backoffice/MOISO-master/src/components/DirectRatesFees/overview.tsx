import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import {
    TrendingUp,
    ReceiptText,
    Search,
    Download,
    Upload,
    Pencil,
    Plus,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
type Fees =
    | 'Fees Structures'
    | 'Corridor Fees'
    | 'Cancellation Charges';

type ExchangeRate = {
    _id: string;
    currentPair?: string;
    txnType?: string;
    rate?: string | number;
    spread?: string | number;
    buyRate?: string | number;
    sellRate?: string | number;
    mode?: string;
    lastUpdated?: string;
};

const fees: Fees[] = [
    'Fees Structures',
    'Corridor Fees',
    'Cancellation Charges'
];
function OverView() {
    const [activeTab, setActiveTab] = useState<"exchangeRate" | "fees">("exchangeRate");
    const [activeFee, setActiveFee] = useState<Fees>("Fees Structures");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const exchangeRates: ExchangeRate[] = [];
    const feeStructures = [];

    const filteredSearch = exchangeRates.filter((item) =>
        `${item.currentPair ?? ""} ${item.txnType ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
    const handleDownloadCSV = () => {
        const headers = [
            "Current Pair",
            "Txn Type",
            "Rate",
            "Spread",
            "Buy Rate",
            "Sell Rate",
            "Mode",
            "Last Updated",
        ];
        const csvRows = [
            headers,
            ...filteredSearch.map((item) => [
                item.currentPair ?? "",
                item.txnType ?? "",
                item.rate ?? "",
                item.spread ?? "",
                item.buyRate ?? "",
                item.sellRate ?? "",
                item.mode ?? "",
                item.lastUpdated ?? "",
            ]),
        ];

        const escapeCSV = (value: string | number) =>
            `"${String(value).replace(/"/g, '""')}"`;

        const csvContent = csvRows
            .map((row) => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "exchange-rates.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const handleIncrementPage = () => {
        setCurrentPage(prev => prev + 1)
    }
    const handleDecrementPage = () => {
        setCurrentPage(prev => prev - 1)
    }
    // Upload CSV
    const handleUploadCSV = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            alert("Please select a valid CSV file.");
            event.target.value = "";
            return;
        }
        console.log("Selected CSV file:", file.name);
        console.log("File size:", file.size, "bytes");

        alert(
            `Selected file: ${file.name}. Connect the backend API to import exchange rates.`
        );
        event.target.value = "";
    };
    return (
        <div className="space-y-6 pb-8">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Direct Rates & Fees
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Manage exchange rates, fee structures, and corridor charges in one place.
                    </p>
                </div>
            </header>

            <div className="grid gap-2 sm:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Rates</p>
                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                                {exchangeRates.length}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">Configured exchange rates</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                            <TrendingUp size={15} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-5 h-1 rounded bg-blue-100">
                        <div className="h-1 w-1 rounded-full bg-blue-500" />
                    </div>
                </section>
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Fee Structures</p>
                            <h2 className="mt-3 text-2xl font-bold text-slate-900">
                                {feeStructures.length}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">Configured remitter fees</p>
                        </div>
                        <div className="rounded-xl p-3">
                            <ReceiptText size={20} className="text-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-5 h-1 rounded bg-emerald-100">
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    </div>
                </section>
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex gap-1 border-b border-slate-200 px-5">
                    {(["exchangeRate", "fees"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${activeTab === tab
                                ? "border-violet-600 text-violet-700"
                                : "border-transparent text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            {tab === "exchangeRate" ? "Exchange Rate" : "Fees"}
                        </button>
                    ))}
                </div>

                <div className="p-5 sm:p-6">
                    {activeTab === "exchangeRate" ? (
                        <div className="space-y-5">
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Current Exchange Rates
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Manage and view your exchange rates here.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadCSV}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-400"
                                    >
                                        <Upload size={16} />
                                        Upload CSV
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={handleUploadCSV}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Pencil size={16} />
                                        Edit Sell Rate
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-400"
                                    >
                                        <Plus size={16} />
                                        Create Sell Rate
                                    </button>
                                </div>
                            </div>

                            <div className="relative max-w-md">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search exchange rates..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                />
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px] border-collapse text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {[
                                                    "Current Pair",
                                                    "Txn Type",
                                                    "Rate",
                                                    "Spread",
                                                    "Buy Rate",
                                                    "Sell Rate",
                                                    "Mode",
                                                    "Last Updated",
                                                    "Actions",
                                                ].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-md font-bold uppercase tracking-wide text-slate-500"
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSearch.length > 0 ? (
                                                filteredSearch.map((item) => (
                                                    <tr key={item._id} className="transition-colors hover:bg-slate-50">
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">{item.currentPair}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.txnType}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{item.rate}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.spread}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.buyRate}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.sellRate}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.mode}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{item.lastUpdated}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600"></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="px-6 py-14 text-center">
                                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                                            <div className="mb-4 rounded-full bg-violet-50 p-3 text-violet-700">
                                                                <TrendingUp size={15} className="text-blue-600" />
                                                            </div>
                                                            <p className="font-semibold text-slate-900">
                                                                {/* {search ? "No exchange rates found" : "No exchange rates yet"} */}
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {/* {search
                                                                    ? "Try another search term or clear your search."
                                                                    : "Create a sell rate or upload a CSV to get started."} */}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-225">
                                <button className="flex flex-wrap" onClick={handleIncrementPage} disabled={currentPage === 0}>
                                    <ArrowLeft size={16} />
                                    Previous</button>
                                <button className="flex flex-wrap" onClick={handleDecrementPage} disabled={currentPage === 1}>
                                    <ArrowRight size={16} />
                                    Next</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {activeFee === "Fees Structures" ? "Remitter Fee Structures" : activeFee}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Manage fee rules and charges for your remittance corridors.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Plus size={16} />
                                        Corridor Setup
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-400"
                                    >
                                        <Plus size={16} />
                                        Create Fee Structure
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {fees.map((fee) => (
                                    <button
                                        key={fee}
                                        type="button"
                                        onClick={() => setActiveFee(fee)}
                                        aria-pressed={activeFee === fee}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeFee === fee
                                            ? "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 hover:bg-violet-400"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {fee}
                                    </button>
                                ))}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] border-collapse text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {["Code", "Name", "Fee Details", "Min/Max Fee", "Currency", "Status", "Actions"].map((heading) => (
                                                    <th key={heading} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feeStructures.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-14 text-center">
                                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                                            <div className="mb-4 rounded-full bg-emerald-50 p-3 text-emerald-700">
                                                                <ReceiptText size={22} />
                                                            </div>
                                                            <p className="font-semibold text-slate-900">
                                                                {/* No {activeFee.toLowerCase()} configured */}
                                                            </p>
                                                            {/* <p className="mt-1 text-sm text-slate-500">
                                                                Create a fee structure to see it listed here.
                                                            </p> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-3 text-sm text-slate-600">
                                                        {feeStructures.length} fee structure{feeStructures.length === 1 ? "" : "s"}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
}

export default OverView;