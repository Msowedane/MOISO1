import { useEffect, useState } from "react";
import { ArrowLeftRight, ChevronDown, ExternalLink, Loader2, RefreshCw } from "lucide-react";

interface XELiveRatesWidgetProps {
    className?: string;
}

const currencies = [
    { code: "GBP", name: "British Pound", country: "GB" },
    { code: "INR", name: "Indian Rupee", country: "IN" },
    { code: "USD", name: "US Dollar", country: "US" },
    { code: "OMR", name: "Omani Rial", country: "OM" },
    { code: "EUR", name: "Euro", country: "EU" },
    { code: "AED", name: "UAE Dirham", country: "AE" },
    { code: "BDT", name: "Bangladeshi Taka", country: "BD" },
] as const;

type CurrencyCode = (typeof currencies)[number]["code"];

function CountryFlag({ country }: { country: string }) {
    const flagClass = "relative inline-block h-5 w-7 shrink-0 overflow-hidden rounded-sm border border-slate-200";

    switch (country) {
        case "GB":
            return (
                <span aria-hidden="true" className="relative inline-block h-7 w-7 shrink-0 overflow-hidden rounded-full  border-slate-200 bg-[#012169]">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice">
                        <path d="M0 0h7l53 33v7h-7L0 7zm53 0h7v7L7 40H0v-7z" fill="#fff" />
                        <path d="M0 0h3l57 35v5h-3L0 5zm57 0h3v5L3 40H0v-5z" fill="#c8102e" />
                        <path d="M0 14h60v12H0zm24-14h12v40H24z" fill="#fff" />
                        <path d="M0 17h60v6H0zm27-17h6v40h-6z" fill="#c8102e" />
                    </svg>
                </span>
            );
        case "IN":
            return <span aria-hidden="true" className={`${flagClass} flex items-center justify-center`} style={{ background: "linear-gradient(to bottom, #ff9933 0 33.333%, white 33.333% 66.666%, #138808 66.666% 100%)" }}><span className="h-2 w-2 rounded-full border border-[#000080]" /></span>;
        case "US":
            return <span aria-hidden="true" className={flagClass} style={{ background: "repeating-linear-gradient(to bottom, #b22234 0 7.69%, white 7.69% 15.38%)" }}><span className="absolute left-0 top-0 h-[54%] w-[42%] bg-[#3c3b6e]" /></span>;
        case "OM":
            return <span aria-hidden="true" className={flagClass} style={{ background: "linear-gradient(to right, #db161b 0 25%, transparent 25%), linear-gradient(to bottom, white 0 33.33%, #db161b 33.33% 66.66%, #008000 66.66%)" }} />;
        case "EU":
            return <span aria-hidden="true" className={`${flagClass} flex items-center justify-center bg-[#003399] text-[10px] text-[#ffcc00]`}>✦</span>;
        case "AE":
            return <span aria-hidden="true" className={flagClass} style={{ background: "linear-gradient(to right, #ff0000 0 25%, transparent 25%), linear-gradient(to bottom, #00732f 0 33.33%, white 33.33% 66.66%, #000000 66.66%)" }} />;
        case "BD":
            return <span aria-hidden="true" className={`${flagClass} flex items-center justify-center bg-[#006a4e]`}><span className="h-3 w-3 rounded-full bg-[#f42a41]" /></span>;
        default:
            return null;
    }
}

function CurrencyPicker({
    value,
    onChange,
    label,
}: {
    value: CurrencyCode;
    onChange: (value: CurrencyCode) => void;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const selected = currencies.find((currency) => currency.code === value) ?? currencies[0];

    return (
        <div className="relative">
            <button
                type="button"
                aria-label={`${label}: ${selected.code}`}
                aria-expanded={open}
                onClick={() => setOpen((isOpen) => !isOpen)}
                className="flex h-10 w-full items-center gap-2 rounded-md border bg-white px-3 text-left"
            >
                <CountryFlag country={selected.country} />
                <span>{selected.code}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
            </button>
            {open && (
                <div role="listbox" aria-label={`${label} currency`} className="absolute right-0 top-full z-20 mt-1 max-h-60 w-56 overflow-y-auto rounded-md border bg-white p-1 shadow-lg">
                    {currencies.map((currency) => (
                        <button
                            key={currency.code}
                            type="button"
                            role="option"
                            aria-selected={currency.code === value}
                            onClick={() => {
                                onChange(currency.code);
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
                        >
                            <CountryFlag country={currency.country} />
                            <span>{currency.code} - {currency.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function XELiveRatesWidget({
    className,
}: XELiveRatesWidgetProps) {
    const [amount, setAmount] = useState("0");
    const [from, setFrom] = useState<CurrencyCode>("GBP");
    const [to, setTo] = useState<CurrencyCode>("INR");
    const [rate, setRate] = useState<number | null>(null);
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchRate = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `https://open.er-api.com/v6/latest/${from}`
            );

            if (!response.ok) {
                throw new Error("Unable to fetch exchange rates.");
            }

            const data = await response.json();

            if (data.result !== "success" || !data.rates?.[to]) {
                throw new Error("Exchange rate is unavailable.");
            }

            setRate(data.rates[to]);
            setDate(data.time_last_update_utc || "");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while fetching rates."
            );
            setRate(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchRate();
    }, [from, to]);

    const convertedAmount =
        rate !== null && amount.trim() !== "" && Number.isFinite(Number(amount))
            ? Number(amount) * rate
            : null;

    return (
        <div className={`rounded-xl border bg-white p-4 shadow-sm ${className ?? ""}`}>
            <div className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="flex items-center gap-3 text-xl font-bold">
                            <ExternalLink className="h-5 w-5 text-primary" />
                            Live Currency Converter
                        </h2>

                        <p className="mt-1.5 text-sm text-muted-foreground" style={{ paddingTop: "8px" }}>
                            Check reference exchange rates and convert currencies.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchRate}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-[200px_200px_40px_200px_200px]">
                    <div style={{ width: "200px" }}>
                        {/* <label className="mb-2 block text-sm font-medium"> */}
                        {/* Amount */}
                        {/* </label> */}
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-10 w-full min-w-0 rounded-md border bg-background px-3 font-extrabold"
                            placeholder="Enter amount"
                        />
                    </div>
                    <div style={{ width: "200px" }}>
                        {/* <label className="mb-2 block text-sm font-medium">From</label> */}
                        <CurrencyPicker value={from} onChange={setFrom} label="From" />
                    </div>
                    <button
                        type="button"
                        aria-label="Swap currencies"
                        title="Swap currencies"
                        onClick={() => {
                            setFrom(to);
                            setTo(from);
                        }}
                        disabled={loading}
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ArrowLeftRight className="h-5 w-5" />
                    </button>
                    <div style={{ width: "200px" }}>
                        {/* <label className="mb-2 block text-sm font-medium">To</label> */}
                        <CurrencyPicker value={to} onChange={setTo} label="To" />
                    </div>
                    <div className="min-w-0">
                        {/* <label className="mb-2 block text-sm font-medium">Converted amount</label> */}
                        <div className="flex h-10 min-w-0 items-center rounded-md border bg-muted/30 px-3" style={{ width: "200px" }}>
                            {loading ? (
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Fetching...
                                </span>
                            ) : error ? (
                                <span className="truncate text-sm text-red-500" title={error}>{error}</span>
                            ) : rate !== null && convertedAmount !== null ? (
                                <span className="truncate text-lg font-bold" title={convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}>
                                    {convertedAmount.toLocaleString(undefined, {
                                        maximumFractionDigits: 4,
                                    })}
                                </span>
                            ) : (
                                <span className="truncate text-sm text-muted-foreground">Enter an amount</span>
                            )}
                        </div>
                    </div>
                </div>

                {rate !== null && (
                    <p className="text-md text-muted-foreground pt-1 font-semibold">
                        1 {from} = {rate.toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                        })}{" "}
                        {to}{date && ` · Last updated: ${date}`}
                    </p>
                )}
                <section className="flex">
                    <div >
                        <p className="text-sm text-muted-foreground pb-1" style={{ paddingBottom: "0px" }}>
                            Indicative reference rates only. These are not guaranteed
                            remittance or transaction execution rates.
                        </p>
                    </div>
                    <div style={{ paddingRight: "20px" }}>
                        {/* <a
                            href="https://www.xe.com/currencyconverter/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Visit XE Currency Converter
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a> */}
                    </div>
                </section>
            </div>
        </div >
    );
}
