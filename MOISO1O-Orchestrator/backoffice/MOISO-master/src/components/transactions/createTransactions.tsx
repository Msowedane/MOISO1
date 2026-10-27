import { useEffect, useState } from "react";
import {
    Banknote,
    Building2,
    Check,
    ArrowLeft,
    ArrowRight,
    CreditCard,
    FileText,
    Globe2,
} from "lucide-react";
import CreateBeneficiary from "../createBeneficiary";
import CreateRemitter from "../createremitter";
import TransactionSummary from "../transactionSummary";
import {
    getFrontendBeneficiaries,
    getFrontendRemitters,
    type FrontendBeneficiary,
    type FrontendRemitter,
} from "../../lib/frontendStore";
// @ts-expect-error CSS side-effect imports are handled by the bundler.
import "flag-icons/css/flag-icons.min.css";

type DestinationCountry = {
    code: string;
    name: string;
};

const destinationCountryCodes = `
    AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
    CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
    DE DJ DK DM DO DZ
    EC EE EG EH ER ES ET
    FI FJ FK FM FO FR
    GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
    HK HM HN HR HT HU
    ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
    KE KG KH KI KM KN KP KR KW KY KZ
    LA LB LC LI LK LR LS LT LU LV LY
    MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
    NA NC NE NF NG NI NL NO NP NR NU NZ
    OM
    PA PE PF PG PH PK PL PM PN PR PS PT PW PY
    QA
    RE RO RS RU RW
    SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
    TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
    UA UG UM US UY UZ
    VA VC VE VG VI VN VU
    WF WS
    YE YT
    ZA ZM ZW
`.trim().split(/\s+/);

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const destinationCountries: DestinationCountry[] = destinationCountryCodes
    .map((code) => {
        const name = countryNames.of(code);

        if (!name) {
            throw new Error(`Missing display name for country code: ${code}`);
        }

        return { code, name };
    })
    .sort((first, second) => first.name.localeCompare(second.name));

const currencyByCountry: Record<string, string> = {
    India: "INR",
    Russia: "RUB",
    "United States": "USD",
    "United Kingdom": "GBP",
    "United Arab Emirates": "AED",
    "Saudi Arabia": "SAR",
    Oman: "OMR",
    Bangladesh: "BDT",
    Pakistan: "PKR",
    "Sri Lanka": "LKR",
    Nepal: "NPR",
    China: "CNY",
    Japan: "JPY",
    Singapore: "SGD",
    Malaysia: "MYR",
    Thailand: "THB",
    Philippines: "PHP",
    Indonesia: "IDR",
    Qatar: "QAR",
    Kuwait: "KWD",
    Bahrain: "BHD",
    Canada: "CAD",
    Australia: "AUD",
    "New Zealand": "NZD",
    Germany: "EUR",
    France: "EUR",
    Italy: "EUR",
    Spain: "EUR",
    "South Africa": "ZAR",
};

function CreateTransactions({ embedded = false }: { embedded?: boolean }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
    const [showRemitterModal, setShowRemitterModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<
        "Account Transfer" | "Cash Pickup"
    >("Account Transfer");
    const [sourceCountry, setSourceCountry] = useState("United Kingdom");
    const [sourceCurrency, setSourceCurrency] = useState("GBP");
    const [sendAmount, setSendAmount] = useState("");
    const [recipientAmount, setRecipientAmount] = useState("");
    const [sourceOfIncome, setSourceOfIncome] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentPurpose, setPaymentPurpose] = useState("");
    const [purposeDescription, setPurposeDescription] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [remitterSearch, setRemitterSearch] = useState("");
    const [remitters, setRemitters] = useState<FrontendRemitter[]>([]);
    const [beneficiarySearch, setBeneficiarySearch] = useState("");
    const [beneficiaries, setBeneficiaries] = useState<FrontendBeneficiary[]>([]);
    const [storageError, setStorageError] = useState("");
    const hasRemitter = Boolean(remitterSearch.trim());

    const refreshRecords = () => {
        try {
            setRemitters(getFrontendRemitters());
            setBeneficiaries(getFrontendBeneficiaries());
            setStorageError("");
        } catch (error) {
            setStorageError(
                error instanceof Error
                    ? error.message
                    : "Unable to load saved remitters and beneficiaries."
            );
        }
    };

    useEffect(() => {
        refreshRecords();
    }, []);

    const matchingRemitters = remitters.filter((remitter) =>
        [
            remitter.firstName,
            remitter.lastName,
            remitter.email,
            remitter.mobileNumber,
            remitter.customerId,
            remitter.id,
        ]
            .join(" ")
            .toLowerCase()
            .includes(remitterSearch.trim().toLowerCase())
    );

    const matchingBeneficiaries = beneficiaries.filter((beneficiary) =>
        [
            beneficiary.beneficiaryName,
            beneficiary.beneficiaryId,
            beneficiary.contactInfo,
            beneficiary.country,
        ]
            .join(" ")
            .toLowerCase()
            .includes(beneficiarySearch.trim().toLowerCase())
    );

    const [selectedCountryCode = "", ...selectedCountryNameParts] =
        selectedCountry.split(" ");
    const destinationCountryName = selectedCountryNameParts.join(" ");
    const destinationCurrency =
        currencyByCountry[destinationCountryName] ?? "USD";
    const matchingDestinationCountries = destinationCountries.filter(
        ({ name, code }) =>
            `${name} ${code}`
                .toLowerCase()
                .includes(countrySearch.trim().toLowerCase())
    );

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
        <main
            className={`w-full min-w-0 overflow-x-hidden bg-slate-50 ${embedded ? "" : "px-2 py-2 sm:px-4"
                }`}
        >
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
                </header>

                {storageError && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {storageError}
                    </p>
                )}

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
                                {currentStep > step ||
                                    (step === 0 && hasRemitter) ? (
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
                {currentStep === 0 && (
                    <section className="w-full max-w-5xl space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Globe2 size={21} className="text-slate-800" />
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Select Destination Country
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Choose where the funds will be sent
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="destinationCountry"
                                    className="block text-base font-medium text-slate-700"
                                >
                                    Destination Country *
                                </label>
                                <div className="relative w-full max-w-md">
                                    <button
                                        id="destinationCountry"
                                        type="button"
                                        aria-haspopup="listbox"
                                        aria-expanded={countryDropdownOpen}
                                        onClick={() =>
                                            setCountryDropdownOpen(!countryDropdownOpen)
                                        }
                                        className="flex h-12 w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-left text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    >
                                        {selectedCountryCode ? (
                                            <span
                                                aria-hidden="true"
                                                className={`fi fi-${selectedCountryCode.toLowerCase()}`}
                                            />
                                        ) : null}
                                        <span className="flex-1">
                                            {destinationCountryName ||
                                                "-- Select a country --"}
                                        </span>
                                        <span aria-hidden="true" className="text-slate-500">
                                            ▾
                                        </span>
                                    </button>
                                    {countryDropdownOpen && (
                                        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg">
                                            <input
                                                type="search"
                                                autoFocus
                                                aria-label="Search destination countries"
                                                value={countrySearch}
                                                onChange={(event) =>
                                                    setCountrySearch(event.target.value)
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === "Escape") {
                                                        setCountryDropdownOpen(false);
                                                    }
                                                }}
                                                placeholder="Search countries..."
                                                className="h-11 w-full border-b border-slate-200 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-inset focus:ring-slate-200"
                                            />
                                            <ul
                                                role="listbox"
                                                aria-labelledby="destinationCountry"
                                                className="max-h-64 overflow-y-auto p-1"
                                            >
                                                {matchingDestinationCountries.length ? (
                                                    matchingDestinationCountries.map(
                                                        ({ code, name }) => (
                                                            <li
                                                                key={code}
                                                                role="option"
                                                                aria-selected={
                                                                    selectedCountryCode === code
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCountry(
                                                                            `${code} ${name}`
                                                                        );
                                                                        setCountryDropdownOpen(
                                                                            false
                                                                        );
                                                                        setCountrySearch("");
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`fi fi-${code.toLowerCase()}`}
                                                                    />
                                                                    <span>{name}</span>
                                                                </button>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li className="px-3 py-2 text-sm text-slate-500">
                                                        No countries found.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                {selectedCountry && (
                                    <p className="text-sm text-slate-500">
                                        Pays out in {destinationCurrency}
                                    </p>
                                )}
                            </div>

                            {selectedCountry && (
                                <>
                                    <div className="space-y-3">
                                        <h3 className="text-base font-medium text-slate-800">
                                            Payout Method *
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {(
                                                [
                                                    {
                                                        label: "Account Transfer",
                                                        icon: Building2,
                                                    },
                                                    {
                                                        label: "Cash Pickup",
                                                        icon: Banknote,
                                                    },
                                                ] as const
                                            ).map(({ label, icon: Icon }) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedPayoutMethod(label)
                                                    }
                                                    aria-pressed={
                                                        selectedPayoutMethod === label
                                                    }
                                                    className={`flex min-h-14 items-center justify-center gap-3 rounded-xl border px-4 py-3 text-base font-medium transition ${selectedPayoutMethod === label
                                                        ? "border-slate-500 bg-slate-100 text-slate-900"
                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    <Icon size={20} />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Only beneficiaries set up for this method will be offered.
                                        </p>
                                    </div>

                                </>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <label
                                    htmlFor="remitter"
                                    className="block text-base font-medium text-slate-700"
                                >
                                    Enter or search remitter
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowRemitterModal(true)}
                                    className="rounded-lg bg-violet-200 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400"
                                >
                                    + Add Remitter
                                </button>
                            </div>
                            <input
                                id="remitter"
                                type="search"
                                value={remitterSearch}
                                onChange={(event) => {
                                    setRemitterSearch(event.target.value);
                                }}
                                placeholder="Enter remitter name, phone, email or ID"
                                className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {matchingRemitters.map((remitter) => (
                                    <button
                                        key={remitter.id}
                                        type="button"
                                        onClick={() => {
                                            setRemitterSearch(
                                                `${remitter.firstName} ${remitter.lastName}`.trim()
                                            );
                                        }}
                                        className={`w-full rounded-lg border p-3 text-left transition ${remitterSearch ===
                                            `${remitter.firstName} ${remitter.lastName}`.trim()
                                            ? "border-violet-400 bg-violet-50"
                                            : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
                                            }`}
                                    >
                                        <span className="block font-medium text-slate-900">
                                            {remitter.firstName} {remitter.lastName}
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-500">
                                            {remitter.mobileNumber} · {remitter.email} · {remitter.customerId}
                                        </span>
                                    </button>
                                ))}
                                {/* {matchingRemitters.length === 0 && (
                                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                        No saved remitter matches. You can continue with the value entered above.
                                    </p>
                                )} */}
                            </div>
                        </div>
                    </section>
                )}

                {currentStep === 1 && (
                    <section className="w-full max-w-5xl space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Beneficiary
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowBeneficiaryModal(true)}
                                className="rounded-lg bg-violet-200 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
                            >
                                + Add Beneficiary
                            </button>
                        </div>
                        <div className="space-y-3">
                            <label
                                htmlFor="transaction-beneficiary-search"
                                className="block text-base font-medium text-slate-700"
                            >
                                Search Beneficiary
                            </label>
                            <input
                                id="transaction-beneficiary-search"
                                type="search"
                                value={beneficiarySearch}
                                onChange={(event) =>
                                    setBeneficiarySearch(event.target.value)
                                }
                                placeholder="Search by name, phone, email or beneficiary ID"
                                className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                            {beneficiarySearch.trim() && (
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {matchingBeneficiaries.map((beneficiary) => (
                                        <div
                                            key={beneficiary.id}
                                            className="rounded-lg border border-slate-200 bg-white p-3"
                                        >
                                            <p className="font-medium text-slate-900">
                                                {beneficiary.beneficiaryName}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {beneficiary.country} · {beneficiary.contactInfo} · {beneficiary.beneficiaryId}
                                            </p>
                                        </div>
                                    ))}
                                    {matchingBeneficiaries.length === 0 && (
                                        <p className="text-sm text-slate-500">
                                            No beneficiaries found.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {showBeneficiaryModal && (
                    <div
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setShowBeneficiaryModal(false);
                            }
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="transaction-beneficiary-modal-title"
                            className="my-auto max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                                <h2
                                    id="transaction-beneficiary-modal-title"
                                    className="text-lg font-semibold text-slate-900"
                                >
                                    Add Beneficiary
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowBeneficiaryModal(false)}
                                    aria-label="Close beneficiary form"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    Close
                                </button>
                            </div>
                            <CreateBeneficiary
                                embedded
                                onCancel={() => setShowBeneficiaryModal(false)}
                                onCreated={() => {
                                    refreshRecords();
                                    setShowBeneficiaryModal(false);
                                }}
                            />
                        </section>
                    </div>
                )}

                {showRemitterModal && (
                    <div
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setShowRemitterModal(false);
                            }
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6"
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-label="Create Remitter"
                            className="my-auto max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl"
                        >
                            <CreateRemitter
                                embedded
                                onClose={() => setShowRemitterModal(false)}
                                onCreated={() => {
                                    refreshRecords();
                                    try {
                                        const savedRemitters =
                                            getFrontendRemitters();
                                        const createdRemitter =
                                            savedRemitters[
                                            savedRemitters.length - 1
                                            ];
                                        if (createdRemitter) {
                                            setRemitterSearch(
                                                `${createdRemitter.firstName} ${createdRemitter.lastName}`.trim()
                                            );
                                        }
                                    } catch (error) {
                                        setStorageError(
                                            error instanceof Error
                                                ? error.message
                                                : "Remitter was created, but the saved list could not be refreshed."
                                        );
                                    }
                                    setShowRemitterModal(false);
                                }}
                            />
                        </section>
                    </div>
                )}

                {currentStep === 2 && (
                    <section className="w-full space-y-8">
                        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
                            <header className="flex items-center gap-3">
                                <CreditCard size={22} className="text-slate-900" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Transfer Amount
                                    </h2>
                                    <p className="mt-1 text-slate-500">
                                        Enter the {sourceCurrency} amount to send to{" "}
                                        {destinationCountryName || "the destination"}
                                    </p>
                                </div>
                            </header>

                            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                                <h3 className="flex items-center gap-3 text-lg font-medium text-slate-900">
                                    <Globe2 size={20} />
                                    Source
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="transaction-source-country"
                                            className="block text-sm font-medium text-slate-600"
                                        >
                                            Source Country
                                        </label>
                                        <select
                                            id="transaction-source-country"
                                            value={sourceCountry}
                                            onChange={(event) =>
                                                setSourceCountry(event.target.value)
                                            }
                                            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                        >
                                            <option value="United Kingdom">
                                                United Kingdom
                                            </option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="transaction-source-currency"
                                            className="block text-sm font-medium text-slate-600"
                                        >
                                            Source Currency
                                        </label>
                                        <select
                                            id="transaction-source-currency"
                                            value={sourceCurrency}
                                            onChange={(event) =>
                                                setSourceCurrency(event.target.value)
                                            }
                                            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                        >
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Originates from {sourceCountry} in {sourceCurrency}. A matching active corridor and rate are required.
                                </p>
                            </section>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="transaction-send-amount"
                                        className="block font-medium text-slate-900"
                                    >
                                        Send Amount ({sourceCurrency})
                                    </label>
                                    <input
                                        id="transaction-send-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={sendAmount}
                                        onChange={(event) =>
                                            setSendAmount(event.target.value)
                                        }
                                        placeholder="£ 0.00"
                                        className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="transaction-recipient-amount"
                                        className="block font-medium text-slate-900"
                                    >
                                        Recipient Gets ({destinationCurrency})
                                    </label>
                                    <input
                                        id="transaction-recipient-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={recipientAmount}
                                        onChange={(event) =>
                                            setRecipientAmount(event.target.value)
                                        }
                                        placeholder="0.00"
                                        className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
                            <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                                <FileText size={22} />
                                Purpose &amp; Notes
                            </h2>
                            <div className="space-y-2">
                                <label
                                    htmlFor="transaction-source-income"
                                    className="block font-medium text-slate-900"
                                >
                                    Source of Income
                                </label>
                                <select
                                    id="transaction-source-income"
                                    value={sourceOfIncome}
                                    onChange={(event) =>
                                        setSourceOfIncome(event.target.value)
                                    }
                                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select source of income...</option>
                                    <option>Salary</option>
                                    <option>Business income</option>
                                    <option>Savings</option>
                                    <option>Investments</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="transaction-payment-method"
                                    className="block font-medium text-slate-900"
                                >
                                    Payment Method <span className="font-normal text-slate-500">(optional)</span>
                                </label>
                                <select
                                    id="transaction-payment-method"
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(event.target.value)
                                    }
                                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select payment method...</option>
                                    <option>Bank Transfer</option>
                                    <option>Debit Card</option>
                                    <option></option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="transaction-payment-purpose"
                                    className="block font-medium text-slate-900"
                                >
                                    Purpose of Payment *
                                </label>
                                <select
                                    id="transaction-payment-purpose"
                                    required
                                    value={paymentPurpose}
                                    onChange={(event) =>
                                        setPaymentPurpose(event.target.value)
                                    }
                                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select Purpose of Payment</option>
                                    <option>Family support</option>
                                    <option>Education</option>
                                    <option>Medical expenses</option>
                                    <option>Living expenses</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="transaction-purpose-description"
                                    className="block font-medium text-slate-900"
                                >
                                    Purpose Description <span className="font-normal text-slate-500">(optional)</span>
                                </label>
                                <textarea
                                    id="transaction-purpose-description"
                                    rows={3}
                                    value={purposeDescription}
                                    onChange={(event) =>
                                        setPurposeDescription(event.target.value)
                                    }
                                    placeholder="Additional details about the purpose..."
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="transaction-admin-notes"
                                    className="block font-medium text-slate-900"
                                >
                                    Admin Notes <span className="font-normal text-slate-500">(optional)</span>
                                </label>
                                <textarea
                                    id="transaction-admin-notes"
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(event) =>
                                        setAdminNotes(event.target.value)
                                    }
                                    placeholder="Internal notes for this transaction..."
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                        </section>
                    </section>
                )}

                {currentStep === 3 && (
                    <TransactionSummary
                        remitter={remitterSearch}
                        beneficiary={beneficiarySearch}
                        destinationCountry={destinationCountryName}
                        payoutMethod={selectedPayoutMethod}
                        sourceCountry={sourceCountry}
                        sourceCurrency={sourceCurrency}
                        destinationCurrency={destinationCurrency}
                        sendAmount={sendAmount}
                        recipientAmount={recipientAmount}
                        sourceOfIncome={sourceOfIncome}
                        paymentMethod={paymentMethod}
                        paymentPurpose={paymentPurpose}
                        purposeDescription={purposeDescription}
                        adminNotes={adminNotes}
                        confirmed={paymentConfirmed}
                        onConfirmChange={setPaymentConfirmed}
                    />
                )}

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

                    {currentStep < 3 && (
                        <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={currentStep === 0 && !hasRemitter}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ArrowRight size={16} />
                        </button>
                    )}

                </section>
            </section>
        </main>
    );
}

export default CreateTransactions;