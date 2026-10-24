import { useState } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import CreateRemitter from "../createremitter";
type DestinationCountry = string[];

const destinationCountries: DestinationCountry = [
    "🇮🇳 India",
    "🇷🇺 Russia",
    "🇺🇸 United States",
    "🇬🇧 United Kingdom",
    "🇦🇪 United Arab Emirates",
    "🇸🇦 Saudi Arabia",
    "🇴🇲 Oman",
    "🇧🇩 Bangladesh",
    "🇵🇰 Pakistan",
    "🇱🇰 Sri Lanka",
    "🇳🇵 Nepal",
    "🇨🇳 China",
    "🇯🇵 Japan",
    "🇸🇬 Singapore",
    "🇲🇾 Malaysia",
    "🇹🇭 Thailand",
    "🇵🇭 Philippines",
    "🇮🇩 Indonesia",
    "🇶🇦 Qatar",
    "🇰🇼 Kuwait",
    "🇧🇭 Bahrain",
    "🇺🇸 United States",
    "🇨🇦 Canada",
    "🇦🇺 Australia",
    "🇳🇿 New Zealand",
    "🇩🇪 Germany",
    "🇫🇷 France",
    "🇮🇹 Italy",
    "🇪🇸 Spain",
    "🇿🇦 South Africa",
];
function CreateTransactions() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [remitterSearch, setRemitterSearch] = useState("");
    const [showRemitter, setRemitter] = useState(false)
    const [remitterCreated, setRemitterCreated] = useState(false);
    const hasRemitter = remitterCreated || remitterSearch.trim().length > 0;
    const handleNextPage = () => {
        if (currentStep === 0 && !hasRemitter) return;
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }
    return (
        <main className="w-full min-w-0 overflow-x-hidden bg-slate-50 px-2 py-2 sm:px-4">
            <section className="flex w-full min-w-0 flex-col gap-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
                <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 flex gap-2 ">
                        <button
                            type="button"
                            onClick={() =>
                                window.location.assign(
                                    "/dashboard?tab=transactions"
                                )
                            }
                            className="self-start rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 sm:self-auto"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            Create Transaction
                        </h1>
                        {/* <p className="text-sm text-slate-600">Complete each step to prepare a transaction.</p> */}
                    </div>
                    <button onClick={() => {
                        setRemitter(!showRemitter)
                    }} className="flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2 text-sm font-medium text-white hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40">+ Create Remitter</button>
                    {
                        showRemitter && (
                            <div>
                                <CreateRemitter
                                    onClose={() => setRemitter(false)}
                                    onCreated={() => {
                                        setRemitterCreated(true);
                                        setRemitter(false);
                                    }}
                                />
                            </div>
                        )
                    }
                </header>

                {/* Step indicators */}
                <section aria-label="Transaction progress" className="flex w-full py-1 sm:gap-8">
                    {[0, 1, 2, 3].map((step) => (
                        <div
                            key={step}
                            aria-current={currentStep === step ? "step" : undefined}
                            className="flex flex-col items-center gap-2"
                        >
                            <div
                                className={`flex h-15 w-15 items-center justify-center rounded-full text-lg border-2 ${currentStep >= step
                                    ? "border-violet-200 bg-violet-400 text-white"
                                    : "border-slate-300 bg-white text-slate-400"
                                    }`}
                            >
                                {currentStep > step || (step === 0 && hasRemitter) ? (
                                    <Check size={20} />
                                ) : (
                                    step + 1
                                )}
                            </div>

                            <span className="text-sm text-slate-600">
                                Step {step + 1}
                            </span>
                        </div>
                    ))}
                </section>
                <section className="w-full max-w-5xl space-y-8">
                    <div className="w-full space-y-2">
                        <label
                            htmlFor="destinationCountry"
                            className="block text-base font-medium text-slate-700"
                        >
                            Select Destination Country
                        </label>
                        <select
                            id="destinationCountry"
                            required
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="h-12 w-64 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        >
                            <option value="" disabled>
                                -- Select a country --
                            </option>

                            {destinationCountries.map((item, index) => (
                                <option key={`${item}-${index}`} value={item} className="">
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1 space-y-2">
                            <label htmlFor="remitter" className="block text-base font-medium text-slate-700">
                                Select Remitter
                            </label>
                            <input
                                id="remitter"
                                type="search"
                                value={remitterSearch}
                                onChange={(event) => setRemitterSearch(event.target.value)}
                                placeholder="Search remitters"
                                className="h-12 w-64 rounded-lg border border-slate-300 px-4 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                    </div>

                </section>

                <section className="flex w-full justify-between border-t border-slate-200 pt-6">
                    <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={currentStep === 3 || (currentStep === 0 && !hasRemitter)}
                        className="flex items-center gap-2 rounded-lg bg-violet-100 px-4 py-2 text-sm font-medium text-white hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                        <ArrowRight size={16} />
                    </button>

                </section>
            </section>
        </main>
    );
}

export default CreateTransactions;