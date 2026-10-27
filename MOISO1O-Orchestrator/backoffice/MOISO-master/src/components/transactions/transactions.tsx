
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Activity, Archive, ChevronDown, CircleAlert, CircleX, Download, LoaderCircle, Plus, RefreshCw, RotateCcw, Upload } from "lucide-react";
import AdvancedSearch from "./advancedSearch";
const payoutMethods: string[] = [
    'Account Type',
    'Mobile Wallet',
    'Cash PickUp'
]
const transactionTypes: { label: string; value: string }[] = [
    { label: "B2C (Business to Customer)", value: "B2C" },
    { label: "B2B (Business to Business)", value: "B2B" },
    { label: "C2C (Customer to Customer)", value: "C2C" },
    { label: "C2B (Customer to Business)", value: "C2B" },
];
const statusTypes: string[] = [
    'Live Transactions',
    'pending',
    'pending Approval',
    'Approved for payment',
    'Compliance check',
    'Needs Review',
    'Unasigned',
    'Processing',
    'Rejected',
    'Delivered',
    'Aborted',
    'Canceled',
    'Deleted'
]

const paymentMethod: string[] = [
    'Manual Acount Transfer',
    'Google Pay',
    'Phone Pay',
    'Paytm',
    'Debit/credit Card',
    'Account Type',
    'Open Banking',
    'Card(Hosted Payment)',
    'Wallet',
    'Cash',
    'Apple Pay',
    'Yapily(Account Transfer)',
    'Bulk Payment',
    'Admin Initiated'
]
const days: string[] = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Year",
    "Custom Range",
];
const AgentType: string[] = [
    'Direct (non-agent)',
    'Any Agent',
    'Standard',
    'Pay-in Partner',
    'White label'
]

type FilterOption = { label: string; value: string };

function FilterDropdown({
    id,
    label,
    value,
    options,
    isOpen,
    onToggle,
    onSelect,
}: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
}) {
    const selectedOption = options.find((option) => option.value === value) ?? options[0];
    return (
        <div className="relative flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
            <span className="block">{label}</span>
            <button
                id={`${id}-trigger`}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-options`}
                onClick={onToggle}
                onKeyDown={(event) => {
                    if (event.key === "Escape" && isOpen) onToggle();
                }}
                className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-normal text-slate-700 outline-none transition hover:border-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <div
                    id={`${id}-options`}
                    role="listbox"
                    aria-labelledby={`${id}-trigger`}
                    className="absolute left-0 top-full z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                >
                    {options.map((option) => (
                        <button
                            key={option.value || "all"}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => onSelect(option.value)}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm font-normal transition-colors ${option.value === value ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Transactions() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPayoutMethod, setSelectedPayoutMethod] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [selectedDateRange, setSelectedDateRange] = useState("");
    const [selectedAgentType, setSelectedAgentType] = useState("");
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200";
    const toggleFilter = (filter: string) => {
        setOpenFilter((current) => current === filter ? null : filter);
    };
    const [clickedName, setClickedName] = useState("");
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setClickedName(event.currentTarget.name);
    };
    const statusButtonClass = "shrink-0 whitespace-nowrap rounded-md px-1 py-1 text-sm font-medium transition-colors duration-200";
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const clearSearch = () => {
        setSearchTerm("");
        setSelectedType("");
        setSelectedStatus("");
        setSelectedPayoutMethod("");
        setSelectedPaymentMethod("");
        setSelectedDateRange("");
        setSelectedAgentType("");
        setOpenFilter(null);
    };

    const handleCreateTransaction = () => {
        window.self.location.href = "/create-transaction";
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            console.log("Selected file:", file.name);
            // filelogic here.
        }

    };

    const handleImport = () => {
        if (selectedFile) {
            console.log("Importing:", selectedFile.name);
            // import API 
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Transactions
                    </h1>
                    <p className="mt-1 text-lg text-slate-500">
                        View and manage all remittance transactions
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard?tab=refunds")}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-100 hover:text-violet-700"
                    >
                        Refunds
                    </button>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-100 hover:text-violet-700"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    {/* File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        onClick={handleImport}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-100 hover:text-violet-700"
                    >
                        <Upload size={16} />
                        {selectedFile ? "Import Selected File" : "Import"}
                    </button>

                    <button
                        type="button"
                        onClick={handleCreateTransaction}
                        className="flex items-center gap-2 rounded-lg bg-violet-200 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                    >
                        <Plus size={18} />
                        Create Transaction
                    </button>
                </div>
            </header>
            <section className="grid grid-cols-5 gap-3">
                <div className="h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3 pb-18">
                        <h2 className="min-w-0 text-base font-semibold leading-6 text-slate-900">Total Transactions</h2>
                        <Activity aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-950">0</p>
                    {/* <p className="mt-1 text-sm leading-5 text-slate-500">0 today</p> */}
                </div>

                <div className="h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="min-w-0 text-base font-semibold leading-6 text-slate-900 ">Active Transactions</h2>
                        <LoaderCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-950 pt-12">0</p>
                    {/* <p className="mt-1 text-sm leading-5 text-slate-500">Needs review, awaiting payout, or in progress</p> */}
                </div>

                <div className="h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3 pb-18">
                        <h2 className="min-w-0 text-base font-semibold leading-6 text-slate-900">Delivered</h2>
                        <Archive aria-hidden="true" className="h-5 w-5 shrink-0 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-950">0</p>
                    {/* <p className="mt-1 text-sm leading-5 text-slate-500">Successfully completed</p> */}
                </div>

                <div className="h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3 pb-18">
                        <h2 className="min-w-0 text-base font-semibold leading-6 text-slate-900">Issues</h2>
                        <CircleAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-950">0</p>
                    {/* <p className="mt-1 text-sm leading-5 text-slate-500">Rejected or aborted</p> */}
                </div>

                <div className="h-[140px] min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3 pb-18">
                        <h2 className="min-w-0 text-base font-semibold leading-6 text-slate-900">Cancelled</h2>
                        <CircleX aria-hidden="true" className="h-5 w-5 shrink-0 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-950">0</p>
                    {/* <p className="mt-1 text-sm leading-5 text-slate-500">Cancelled transactions</p> */}
                </div>
            </section>
            <section aria-labelledby="consolidated-report-title" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 id="consolidated-report-title" className="text-xl font-semibold text-slate-900">
                    Consolidated Report
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Transaction totals and report details will appear here.
                </p>
            </section>

            <section aria-labelledby="transaction-filter-title" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-5">
                    <div>
                        <h2 id="transaction-filter-title" className="text-xl font-semibold text-slate-900">
                            Search &amp; Filter
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Find transactions by keyword or narrow the results using filters.</p>
                    </div>
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                    >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" />
                        Clear Search
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 border-b border-slate-100 pb-5 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        <span>Find Transactions</span>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search transactions"
                            className={`${selectClass} h-11`}
                        />
                    </label>
                    <div className="flex items-end">
                        <button
                            type="button"
                            aria-expanded={isAdvancedSearchOpen}
                            onClick={() => setIsAdvancedSearchOpen((current) => !current)}
                            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                        >
                            {isAdvancedSearchOpen ? "Hide Advanced Search" : "Advanced Search"}
                            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedSearchOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                </div>

                {isAdvancedSearchOpen && (
                    <div
                        className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Advanced transaction search"
                    >
                        <AdvancedSearch onClose={() => setIsAdvancedSearchOpen(false)} />
                    </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FilterDropdown
                        id="transaction-type"
                        label="Transaction Type"
                        value={selectedType}
                        options={[
                            { label: "All Transaction Types", value: "" },
                            ...transactionTypes,
                        ]}
                        isOpen={openFilter === "transaction-type"}
                        onToggle={() => toggleFilter("transaction-type")}
                        onSelect={(value) => {
                            setSelectedType(value);
                            setOpenFilter(null);
                        }}
                    />
                    <FilterDropdown
                        id="transaction-status"
                        label="Status"
                        value={selectedStatus}
                        options={[
                            { label: "All Statuses", value: "" },
                            ...statusTypes.map((status) => ({ label: status, value: status })),
                        ]}
                        isOpen={openFilter === "transaction-status"}
                        onToggle={() => toggleFilter("transaction-status")}
                        onSelect={(value) => {
                            setSelectedStatus(value);
                            setOpenFilter(null);
                        }}
                    />
                    <FilterDropdown
                        id="payout-method"
                        label="Payout Method"
                        value={selectedPayoutMethod}
                        options={[
                            { label: "All Payout Methods", value: "" },
                            ...payoutMethods.map((method) => ({ label: method, value: method })),
                        ]}
                        isOpen={openFilter === "payout-method"}
                        onToggle={() => toggleFilter("payout-method")}
                        onSelect={(value) => {
                            setSelectedPayoutMethod(value);
                            setOpenFilter(null);
                        }}
                    />
                    <FilterDropdown
                        id="payment-method"
                        label="Payment Method"
                        value={selectedPaymentMethod}
                        options={[
                            { label: "All Payment Methods", value: "" },
                            ...paymentMethod.map((method) => ({ label: method, value: method })),
                        ]}
                        isOpen={openFilter === "payment-method"}
                        onToggle={() => toggleFilter("payment-method")}
                        onSelect={(value) => {
                            setSelectedPaymentMethod(value);
                            setOpenFilter(null);
                        }}
                    />
                    <FilterDropdown
                        id="date-range"
                        label="Date Range"
                        value={selectedDateRange}
                        options={[
                            { label: "Any Date", value: "" },
                            ...days.map((day) => ({ label: day, value: day })),
                        ]}
                        isOpen={openFilter === "date-range"}
                        onToggle={() => toggleFilter("date-range")}
                        onSelect={(value) => {
                            setSelectedDateRange(value);
                            setOpenFilter(null);
                        }}
                    />
                    <FilterDropdown
                        id="agent-type"
                        label="Agent Type"
                        value={selectedAgentType}
                        options={[
                            { label: "All Agent Types", value: "" },
                            ...AgentType.map((agent) => ({ label: agent, value: agent })),
                        ]}
                        isOpen={openFilter === "agent-type"}
                        onToggle={() => toggleFilter("agent-type")}
                        onSelect={(value) => {
                            setSelectedAgentType(value);
                            setOpenFilter(null);
                        }}
                    />
                </div>
            </section>
            <section className="flex w-full items-center justify-around gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
                <button name="Need Review" type="button" onClick={handleClick} aria-pressed={clickedName === "Need Review"} className={`${statusButtonClass} ${clickedName === "Need Review" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Need Review
                </button>

                <button name="In Progress" type="button" onClick={handleClick} aria-pressed={clickedName === "In Progress"} className={`${statusButtonClass} ${clickedName === "In Progress" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    In Progress
                </button>

                <button name="Completed" type="button" onClick={handleClick} aria-pressed={clickedName === "Completed"} className={`${statusButtonClass} ${clickedName === "Completed" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Completed
                </button>

                <button name="Issues" type="button" onClick={handleClick} aria-pressed={clickedName === "Issues"} className={`${statusButtonClass} ${clickedName === "Issues" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Issues
                </button>

                <button name="Cancelled" type="button" onClick={handleClick} aria-pressed={clickedName === "Cancelled"} className={`${statusButtonClass} ${clickedName === "Cancelled" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Cancelled
                </button>

                <button name="Unassigned" type="button" onClick={handleClick} aria-pressed={clickedName === "Unassigned"} className={`${statusButtonClass} ${clickedName === "Unassigned" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Unassigned
                </button>

                <button name="Live" type="button" onClick={handleClick} aria-pressed={clickedName === "Live"} className={`${statusButtonClass} ${clickedName === "Live" ? "bg-violet-200 text-violet-800" : "text-slate-700 hover:bg-violet-200"}`}>
                    Live
                </button>
            </section>
            <div className="rounded border border-slate-20 h-100">
                {clickedName && (
                    <p style={{ marginTop: "20px", paddingLeft: "18px", fontWeight: "bold" }}>
                        {clickedName}
                    </p>
                )}

            </div>
            <div className="flex justify-end">
                <button type="button" className="flex w-24 items-center justify-center gap-2 border border-slate-100 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">
                    <Download size={16} />
                    CSV
                </button>
                <button type="button" className="flex w-24 items-center justify-center gap-2 border border-slate-100 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">
                    <Download size={16} />
                    PDF
                </button>
            </div>

        </section>
    );
}

export default Transactions;
