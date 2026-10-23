
import { useState } from "react";
import {
    Search,
    X,
    ChevronDown,
} from "lucide-react";

const transactionTypes = [
    "B2C",
    "B2B",
    "C2C",
    "C2B",
];

const paymentMethods = [
    "Manual Account Transfer",
    "Google Pay",
    "Phone Pay",
    "Paytm",
    "Debit/Credit Card",
    "Account Type",
    "Open Banking",
    "Card (Hosted Payment)",
    "Wallet",
    "Cash",
    "Apple Pay",
    "Bulk Payment",
    "Admin Initiated",
];

const payoutMethods = [
    "Account Type",
    "Mobile Wallet",
    "Cash PickUp",
];

const statuses = [
    "Live Transactions",
    "Pending",
    "Pending Approval",
    "Approved for payment",
    "Compliance check",
    "Needs Review",
    "Unassigned",
    "Processing",
    "Rejected",
    "Delivered",
    "Abort",
    "Cancel",
    "Delete",
];

const agents = [
    "Direct (non-agent)",
    "Any Agent",
    "Standard",
    "Pay-in Partner",
    "White label",
];

const dateRanges = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Year",
    "Custom Range",
];

const currencies = [
    "GBP",
    "INR",
    "USD",
    "EUR",
    "AED",
    "CAD",
    "AUD",
];

const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const selectClass =
    "w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-700 outline-none transition duration-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

type FilterFieldProps = {
    label: string;
    children: React.ReactNode;
};

function FilterField({ label, children }: FilterFieldProps) {
    return (
        <div className="min-w-0 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            {children}
        </div>
    );
}

type SelectFieldProps = {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    placeholder: string;
};

function SelectField({
    label,
    value,
    options,
    onChange,
    placeholder,
}: SelectFieldProps) {
    return (
        <FilterField label={label}>
            <div className="relative">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={selectClass}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </FilterField>
    );
}

function AdvancedSearch({ onClose }: { onClose: () => void }) {
    const [filters, setFilters] = useState({
        reference: "",
        remitter: "",
        beneficiary: "",
        agent: "",
        transactionType: "",
        paymentMethod: "",
        payoutMethod: "",
        status: "",
        dateRange: "",
        minAmount: "0",
        maxAmount: "25000",
        currency: "",
    });

    const updateFilter = (key: keyof typeof filters, value: string) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const clearAll = () => {
        setFilters({
            reference: "",
            remitter: "",
            beneficiary: "",
            agent: "",
            transactionType: "",
            paymentMethod: "",
            payoutMethod: "",
            status: "",
            dateRange: "",
            minAmount: "0",
            maxAmount: "25000",
            currency: "",
        });
    };

    const handleSearch = () => {
        console.log("Transaction filters:", filters);
        // Connect your transaction search API here.
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-5">
                {/* Page Heading */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Transaction Search
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Search, filter and manage your remittance transactions.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close advanced search"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Filter Card */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Card Header */}
                    <div className="flex flex-col gap-1 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Search &amp; Filter
                        </h2>
                        <p className="text-sm text-slate-500">
                            Use the fields below to find specific transactions.
                        </p>
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                        {/* References */}
                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full" />
                                <h3 className="text-base font-semibold text-slate-900">
                                    References
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <FilterField label="Transaction Reference">
                                    <input
                                        type="text"
                                        value={filters.reference}
                                        onChange={(e) =>
                                            updateFilter("reference", e.target.value)
                                        }
                                        placeholder="Transaction Number"
                                        className={inputClass}
                                    />
                                </FilterField>

                                <FilterField label="Remitter">
                                    <input
                                        type="text"
                                        value={filters.remitter}
                                        onChange={(e) =>
                                            updateFilter("remitter", e.target.value)
                                        }
                                        placeholder="Name, email, mobile or code"
                                        className={inputClass}
                                    />
                                </FilterField>

                                <FilterField label="Beneficiary">
                                    <input
                                        type="text"
                                        value={filters.beneficiary}
                                        onChange={(e) =>
                                            updateFilter("beneficiary", e.target.value)
                                        }
                                        placeholder="Beneficiary name"
                                        className={inputClass}
                                    />
                                </FilterField>

                                <FilterField label="Agent">
                                    <input
                                        type="text"
                                        value={filters.agent}
                                        onChange={(e) =>
                                            updateFilter("agent", e.target.value)
                                        }
                                        placeholder="Agent code or trading name"
                                        className={inputClass}
                                    />
                                </FilterField>
                            </div>
                        </section>

                        {/* Transaction Details */}
                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <span className="h-5 w-1 rounded-full" />
                                <h3 className="text-base font-semibold text-slate-900">
                                    Transaction Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <SelectField
                                    label="Transaction Type"
                                    value={filters.transactionType}
                                    options={transactionTypes}
                                    onChange={(value) =>
                                        updateFilter("transactionType", value)
                                    }
                                    placeholder="All Types"
                                />

                                <SelectField
                                    label="Payment Method"
                                    value={filters.paymentMethod}
                                    options={paymentMethods}
                                    onChange={(value) =>
                                        updateFilter("paymentMethod", value)
                                    }
                                    placeholder="All Methods"
                                />

                                <SelectField
                                    label="Payout Method"
                                    value={filters.payoutMethod}
                                    options={payoutMethods}
                                    onChange={(value) =>
                                        updateFilter("payoutMethod", value)
                                    }
                                    placeholder="All Payout Methods"
                                />

                                <SelectField
                                    label="Status"
                                    value={filters.status}
                                    options={statuses}
                                    onChange={(value) => updateFilter("status", value)}
                                    placeholder="All Statuses"
                                />

                                <SelectField
                                    label="Date Range"
                                    value={filters.dateRange}
                                    options={dateRanges}
                                    onChange={(value) =>
                                        updateFilter("dateRange", value)
                                    }
                                    placeholder="All Dates"
                                />

                                <SelectField
                                    label="Agent Type"
                                    value={filters.agent}
                                    options={agents}
                                    onChange={(value) =>
                                        updateFilter("agent", value)
                                    }
                                    placeholder="All Agent Types"
                                />
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center">
                                <span className="h-5 w-1 rounded-full" />
                                <h3 className="font-semibold text-slate-900">
                                    Amount &amp; Currency
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <FilterField label="Min Amount">
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.minAmount}
                                        onChange={(e) =>
                                            updateFilter("minAmount", e.target.value)
                                        }
                                        placeholder="0"
                                        className={inputClass}
                                    />
                                </FilterField>

                                <FilterField label="Maximum Amount">
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.maxAmount}
                                        onChange={(e) =>
                                            updateFilter("maxAmount", e.target.value)
                                        }
                                        placeholder="100"
                                        className={inputClass}
                                    />
                                </FilterField>

                                <SelectField
                                    label="Currency"
                                    value={filters.currency}
                                    options={currencies}
                                    onChange={(value) =>
                                        updateFilter("currency", value)
                                    }
                                    placeholder="All Currencies"
                                />
                            </div>
                        </section>

                        {/* Footer Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                                >
                                    <X size={16} />
                                    Clear All
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-100 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2"
                                >
                                    <Search size={17} />
                                    Search Transactions
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AdvancedSearch;
