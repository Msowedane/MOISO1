
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterOption {
    label: string;
    value: string;
}

function FilterSelect({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find((option) => option.value === value)?.label ?? label;

    useEffect(() => {
        if (!open) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <button
                id={id}
                type="button"
                role="combobox"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((isOpen) => !isOpen)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-3 text-left text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div
                    role="listbox"
                    aria-label={label}
                    className="absolute left-0 top-full z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                                option.value === value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const countries = [
    { label: "United Arab Emirates (AED)", value: "AED" },
    { label: "India (INR)", value: "INR" },
    { label: "Oman (OMR)", value: "OMR" },
    { label: "Oman (USD)", value: "OMR_USD" },
    { label: "United Kingdom (GBP)", value: "GBP" },
    { label: "United Kingdom (USD)", value: "GBP_USD" },
    { label: "United States (USD)", value: "USD" },
    { label: "Saudi Arabia (SAR)", value: "SAR" },
    { label: "Qatar (QAR)", value: "QAR" },
    { label: "Kuwait (KWD)", value: "KWD" },
    { label: "Bahrain (BHD)", value: "BHD" },
    { label: "Singapore (SGD)", value: "SGD" },
    { label: "Malaysia (MYR)", value: "MYR" },
    { label: "Thailand (THB)", value: "THB" },
    { label: "Indonesia (IDR)", value: "IDR" },
    { label: "Philippines (PHP)", value: "PHP" },
    { label: "Pakistan (PKR)", value: "PKR" },
    { label: "Bangladesh (BDT)", value: "BDT" },
    { label: "Sri Lanka (LKR)", value: "LKR" },
    { label: "Nepal (NPR)", value: "NPR" },
    { label: "China (CNY)", value: "CNY" },
    { label: "Japan (JPY)", value: "JPY" },
    { label: "South Korea (KRW)", value: "KRW" },
    { label: "Australia (AUD)", value: "AUD" },
    { label: "New Zealand (NZD)", value: "NZD" },
    { label: "Canada (CAD)", value: "CAD" },
    { label: "Switzerland (CHF)", value: "CHF" },
    { label: "Germany (EUR)", value: "EUR" },
    { label: "South Africa (ZAR)", value: "ZAR" },
];

const payoutMethods = [
    { label: "Account Transfer", value: "ACCOUNT_TRANSFER" },
    { label: "Mobile Wallet", value: "MOBILE_WALLET" },
    { label: "Cash Pickup", value: "CASH_PICKUP" },
    { label: "Debit Card", value: "DEBIT_CARD" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Instant Bank Transfer", value: "INSTANT_BANK_TRANSFER" },
    { label: "Bank Deposit", value: "BANK_DEPOSIT" },
    { label: "Cash Delivery", value: "CASH_DELIVERY" },
    { label: "Mobile Money", value: "MOBILE_MONEY" },
    { label: "Digital Wallet", value: "DIGITAL_WALLET" },
    { label: "UPI Transfer", value: "UPI_TRANSFER" },
    { label: "Home Delivery", value: "HOME_DELIVERY" },
];

const transactionTypes = [
    { label: "B2C (Business to Customer)", value: "B2C" },
    { label: "B2B (Business to Business)", value: "B2B" },
    { label: "C2C (Customer to Customer)", value: "C2C" },
    { label: "C2B (Customer to Business)", value: "C2B" },
];

function QuickRate() {
    const [source, setSource] = useState("ALL");
    const [destination, setDestination] = useState("ALL");
    const [payoutMethod, setPayoutMethod] = useState("ALL");
    const [transactionType, setTransactionType] = useState("ALL");

    return (
        <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Quick Rate
            </h2>

            {/* Filters */}
            <div className="order-2 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* All Sources */}
                <div>
                    <FilterSelect
                        id="source"
                        label="All Sources"
                        value={source}
                        onChange={setSource}
                        options={[{ label: "All Sources", value: "ALL" }, ...countries]}
                    />
                </div>

                {/* All Destinations */}
                <div>
                    <FilterSelect
                        id="destination"
                        label="All Destinations"
                        value={destination}
                        onChange={setDestination}
                        options={[{ label: "All Destinations", value: "ALL" }, ...countries]}
                    />
                </div>

                {/* All Payout Methods */}
                <div>
                    <FilterSelect
                        id="payoutMethod"
                        label="All Payout Methods"
                        value={payoutMethod}
                        onChange={setPayoutMethod}
                        options={[{ label: "All Payout Methods", value: "ALL" }, ...payoutMethods]}
                    />
                </div>

                {/* All Transaction Types */}
                <div>
                    <FilterSelect
                        id="transactionType"
                        label="All Transaction Types"
                        value={transactionType}
                        onChange={setTransactionType}
                        options={[{ label: "All Transaction Types", value: "ALL" }, ...transactionTypes]}
                    />
                </div>
            </div>

            <div className="order-1 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Corridor</th>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Source</th>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Destination</th>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Payout Method</th>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Transaction Type</th>
                            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">Customer Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={6} className="border-t border-slate-200 px-5 py-12 text-center text-slate-500">
                                No rates available.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default QuickRate;
