import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CreditCard,
    UserRound,
} from "lucide-react";
import {
    createFrontendId,
    getFrontendBeneficiaries,
    saveFrontendBeneficiary,
    updateFrontendBeneficiary,
    type FrontendBeneficiary,
} from "../lib/frontendStore";

type PayoutMethod = {
    method: "Account Transfer" | "Cash Pickup";
    receivingCurrency: string;
    BankName: string;
    BranchName: string;
    AccountNumber: string;
    IFSC_Code: string;
    Account_Type: "savings" | "current";
};

type BeneficiaryForm = {
    country: string;
    beneficiaryType: "Consumer" | "Business";
    firstName: string;
    middleName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    payoutMethods: PayoutMethod[];
    nickname: string;
    payment: string;
    test123: string;
    testss: string;
};

type CreateBeneficiaryProps = {
    onCreated?: (beneficiaryId: string) => void;
    onCancel?: () => void;
    embedded?: boolean;
};

const emptyPayoutMethod: PayoutMethod = {
    method: "Account Transfer",
    receivingCurrency: "NGN",
    BankName: "",
    BranchName: "",
    AccountNumber: "",
    IFSC_Code: "",
    Account_Type: "savings",
};

const emptyForm: BeneficiaryForm = {
    country: "India",
    beneficiaryType: "Consumer",
    firstName: "",
    middleName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    payoutMethods: [{ ...emptyPayoutMethod }],
    nickname: "",
    payment: "None",
    test123: "",
    testss: "",
};

const beneficiaryCountries = [
    "Nigeria",
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Singapore",
    "Malaysia",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "Philippines",
];

const currencies = [
    { code: "INR", name: "Indian Rupee" },
    { code: "GBP", name: "Pound Sterling" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "SGD", name: "Singapore Dollar" },
];

function CreateBeneficiary({
    onCreated,
    onCancel,
    embedded = false,
}: CreateBeneficiaryProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const editBeneficiaryId = new URLSearchParams(location.search).get(
        "editBeneficiary"
    );
    const [remitterSearch, setRemitterSearch] = useState("");
    const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(
        Boolean(onCreated)
    );
    const [form, setForm] = useState<BeneficiaryForm>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editBeneficiaryId) return;

        try {
            const beneficiary = getFrontendBeneficiaries().find(
                (record) =>
                    record.id === editBeneficiaryId ||
                    record.beneficiaryId === editBeneficiaryId
            );
            if (!beneficiary) {
                setError("Beneficiary not found. It may have been deleted.");
                setShowBeneficiaryForm(true);
                return;
            }

            const additionalInfoValue = beneficiary.Additonal_Information;
            const additionalInfo =
                typeof additionalInfoValue === "object" &&
                    additionalInfoValue !== null
                    ? additionalInfoValue as Record<string, unknown>
                    : {};

            setForm({
                country:
                    typeof beneficiary.country === "string"
                        ? beneficiary.country
                        : emptyForm.country,
                beneficiaryType:
                    beneficiary.beneficiaryType === "Business"
                        ? "Business"
                        : "Consumer",
                firstName:
                    typeof beneficiary.firstName === "string"
                        ? beneficiary.firstName
                        : "",
                middleName:
                    typeof beneficiary.middleName === "string"
                        ? beneficiary.middleName
                        : "",
                lastName:
                    typeof beneficiary.lastName === "string"
                        ? beneficiary.lastName
                        : "",
                mobileNumber:
                    typeof beneficiary.mobileNumber === "string"
                        ? beneficiary.mobileNumber
                        : "",
                email:
                    typeof beneficiary.email === "string"
                        ? beneficiary.email
                        : "",
                payoutMethods:
                    beneficiary.payoutMethods.length > 0
                        ? beneficiary.payoutMethods.map((method) => ({
                            ...emptyPayoutMethod,
                            ...method,
                        }))
                        : [{ ...emptyPayoutMethod }],
                nickname:
                    typeof additionalInfo.nickname === "string"
                        ? additionalInfo.nickname
                        : "",
                payment:
                    typeof additionalInfo.payment === "string"
                        ? additionalInfo.payment
                        : "None",
                test123:
                    typeof additionalInfo.test123 === "string"
                        ? additionalInfo.test123
                        : "",
                testss:
                    typeof additionalInfo.testss === "string"
                        ? additionalInfo.testss
                        : "",
            });
            setShowBeneficiaryForm(true);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Unable to load beneficiary."
            );
            setShowBeneficiaryForm(true);
        }
    }, [editBeneficiaryId]);

    const updateField = <K extends keyof BeneficiaryForm>(
        field: K,
        value: BeneficiaryForm[K]
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const fullName = [
        form.firstName,
        form.middleName,
        form.lastName,
    ]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");

    const updatePayoutMethod = <K extends keyof PayoutMethod>(
        index: number,
        field: K,
        value: PayoutMethod[K]
    ) => {
        setForm((current) => ({
            ...current,
            payoutMethods: current.payoutMethods.map((method, methodIndex) =>
                methodIndex === index ? { ...method, [field]: value } : method
            ),
        }));
    };

    const addPayoutMethod = () => {
        setForm((current) => ({
            ...current,
            payoutMethods: [
                ...current.payoutMethods,
                { ...emptyPayoutMethod },
            ],
        }));
    };

    const removePayoutMethod = (index: number) => {
        setForm((current) => ({
            ...current,
            payoutMethods: current.payoutMethods.filter(
                (_, methodIndex) => methodIndex !== index
            ),
        }));
    };

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (form.payoutMethods.length === 0) {
            setError("Add at least one payout method.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const existingBeneficiary = editBeneficiaryId
                ? getFrontendBeneficiaries().find(
                    (record) =>
                        record.id === editBeneficiaryId ||
                        record.beneficiaryId === editBeneficiaryId
                )
                : undefined;
            if (editBeneficiaryId && !existingBeneficiary) {
                throw new Error("Beneficiary not found. It may have been deleted.");
            }

            const primaryPayoutMethod = form.payoutMethods[0];
            const beneficiaryId =
                existingBeneficiary?.beneficiaryId ??
                existingBeneficiary?.id ??
                createFrontendId("BEN");
            const beneficiaryRecord: FrontendBeneficiary = {
                ...(existingBeneficiary ?? {}),
                id: existingBeneficiary?.id ?? beneficiaryId,
                beneficiaryId,
                beneficiaryName: fullName,
                name: fullName,
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                country: form.country,
                bankAccount: primaryPayoutMethod.AccountNumber,
                accountNumber: primaryPayoutMethod.AccountNumber,
                contactInfo: form.email,
                relationship: form.nickname || "Other",
                totalReceived: 0,
                status: existingBeneficiary?.status ?? "Pending",
                screening: existingBeneficiary?.screening ?? "Not Screened",
                payoutMethods: form.payoutMethods.map((method) => ({
                    ...method,
                    IFSC_Code: method.IFSC_Code.toUpperCase(),
                })),
                beneficiaryType: form.beneficiaryType,
                receivingCurrency: primaryPayoutMethod.receivingCurrency,
                BankName: primaryPayoutMethod.BankName,
                BranchName: primaryPayoutMethod.BranchName,
                AccountNumber: primaryPayoutMethod.AccountNumber,
                IFSC_Code: primaryPayoutMethod.IFSC_Code.toUpperCase(),
                Account_Type: primaryPayoutMethod.Account_Type,
                mobileNumber: form.mobileNumber,
                email: form.email,
                Additonal_Information: {
                    nickname: form.nickname,
                    payment: form.payment,
                    test123: form.test123,
                    testss: form.testss,
                },
            };
            if (existingBeneficiary) {
                updateFrontendBeneficiary(beneficiaryRecord);
            } else {
                saveFrontendBeneficiary(beneficiaryRecord);
            }
            if (onCreated) {
                onCreated(beneficiaryId);
            } else {
                navigate(
                    `/dashboard?tab=beneficiary-screening&beneficiaryId=${encodeURIComponent(beneficiaryId)}`
                );
            }
        } catch (createError) {
            setError(
                createError instanceof Error
                    ? createError.message
                    : "Unable to create beneficiary."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200";
    const labelClass = "mb-2 block text-sm font-medium text-slate-700";

    return (
        <main className={`${embedded ? "min-h-0" : "min-h-screen"} bg-slate-50 p-4 sm:p-6`}>
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            onCancel ? onCancel() : navigate(-1)
                        }
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                        <ArrowLeft size={18} />

                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {editBeneficiaryId ? "Edit Beneficiary" : "Create Beneficiary"}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {editBeneficiaryId
                                ? "Update the beneficiary details and payout account."
                                : "Enter the beneficiary details and payout account."}
                        </p>
                    </div>
                </header>

                {!showBeneficiaryForm && !editBeneficiaryId && !onCreated ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (remitterSearch.trim()) {
                                setShowBeneficiaryForm(true);
                            }
                        }}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                        <label
                            htmlFor="beneficiary-remitter-search"
                            className={labelClass}
                        >
                            Remitter search
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                id="beneficiary-remitter-search"
                                type="search"
                                value={remitterSearch}
                                onChange={(event) =>
                                    setRemitterSearch(event.target.value)
                                }
                                placeholder="Enter remitter number"
                                className={inputClass}
                                autoComplete="off"
                                required
                            />
                            <button
                                type="submit"
                                disabled={!remitterSearch.trim()}
                                className="shrink-0 rounded-lg bg-violet-200 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter the remitter number to continue to beneficiary details.
                        </p>
                    </form>
                ) : (
                    <form
                        onSubmit={handleCreate}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                        <section className="overflow-hidden rounded-xl border border-slate-200">
                            <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                                <UserRound size={20} className="text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Personal Details
                                </h2>
                            </header>
                            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="beneficiary-country" className={labelClass}>
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="beneficiary-country"
                                        required
                                        value={form.country}
                                        onChange={(event) =>
                                            updateField("country", event.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        {beneficiaryCountries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-type" className={labelClass}>
                                        Beneficiary Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="beneficiary-type"
                                        value={form.beneficiaryType}
                                        onChange={(event) =>
                                            updateField(
                                                "beneficiaryType",
                                                event.target.value as BeneficiaryForm["beneficiaryType"]
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="Consumer">Consumer</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-fullname" className={labelClass}>
                                        Full Name
                                    </label>
                                    <input
                                        id="beneficiary-fullname"
                                        readOnly
                                        value={fullName}
                                        placeholder="Fills from the name fields below"
                                        className={`${inputClass} bg-slate-100`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-firstname" className={labelClass}>
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="beneficiary-firstname"
                                        required
                                        value={form.firstName}
                                        onChange={(event) =>
                                            updateField("firstName", event.target.value)
                                        }
                                        placeholder="Enter first name"
                                        className={inputClass}
                                        autoComplete="given-name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-middlename" className={labelClass}>
                                        Middle Name
                                    </label>
                                    <input
                                        id="beneficiary-middlename"
                                        value={form.middleName}
                                        onChange={(event) =>
                                            updateField("middleName", event.target.value)
                                        }
                                        placeholder="Enter middle name (optional)"
                                        className={inputClass}
                                        autoComplete="additional-name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-lastname" className={labelClass}>
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="beneficiary-lastname"
                                        required
                                        value={form.lastName}
                                        onChange={(event) =>
                                            updateField("lastName", event.target.value)
                                        }
                                        placeholder="Enter last name"
                                        className={inputClass}
                                        autoComplete="family-name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-mobile" className={labelClass}>
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="beneficiary-mobile"
                                        required
                                        type="tel"
                                        value={form.mobileNumber}
                                        onChange={(event) =>
                                            updateField("mobileNumber", event.target.value)
                                        }
                                        placeholder="Include country code, e.g. +234..."
                                        className={inputClass}
                                        autoComplete="tel"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-email" className={labelClass}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="beneficiary-email"
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            updateField("email", event.target.value)
                                        }
                                        placeholder="Enter email address"
                                        className={inputClass}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                            <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Additional Information
                                </h2>
                            </header>
                            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                                <p className="sm:col-span-2 text-sm text-slate-500">
                                    Beneficiary ID details
                                </p>
                                <div>
                                    <label htmlFor="beneficiary-payment" className={labelClass}>
                                        Payment
                                    </label>
                                    <select
                                        id="beneficiary-payment"
                                        value={form.payment}
                                        onChange={(event) =>
                                            updateField("payment", event.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option>None</option>
                                        <option>Account Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-test123" className={labelClass}>
                                        test123
                                    </label>
                                    <input
                                        id="beneficiary-test123"
                                        value={form.test123}
                                        onChange={(event) =>
                                            updateField("test123", event.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-testss" className={labelClass}>
                                        testss
                                    </label>
                                    <input
                                        id="beneficiary-testss"
                                        value={form.testss}
                                        onChange={(event) =>
                                            updateField("testss", event.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="beneficiary-nickname" className={labelClass}>
                                        Nickname <span className="font-normal text-slate-500">(optional)</span>
                                    </label>
                                    <input
                                        id="beneficiary-nickname"
                                        value={form.nickname}
                                        onChange={(event) =>
                                            updateField("nickname", event.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                            <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                                <CreditCard size={20} className="text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Payout Details
                                </h2>
                            </header>
                            <div className="space-y-5 p-5">
                                {form.payoutMethods.map((method, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 p-4 sm:p-5"
                                    >
                                        <div className="mb-5 flex items-center justify-between gap-3">
                                            <h3 className="font-semibold text-slate-900">
                                                Payout Method {index + 1}
                                            </h3>
                                            {form.payoutMethods.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePayoutMethod(index)}
                                                    className="text-sm font-medium text-red-600 hover:text-voilet-00"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>
                                                    Payout Method{" "}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <div
                                                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                                    role="group"
                                                    aria-label={`Payout method ${index + 1}`}
                                                >
                                                    {(
                                                        [
                                                            "Account Transfer",
                                                            "Cash Pickup",
                                                        ] as const
                                                    ).map((value) => {
                                                        const selected =
                                                            method.method === value;
                                                        return (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                aria-pressed={selected}
                                                                onClick={() =>
                                                                    updatePayoutMethod(
                                                                        index,
                                                                        "method",
                                                                        value
                                                                    )
                                                                }
                                                                className={`flex min-h-14 items-center justify-center rounded-xl border px-4 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${selected
                                                                    ? "border-violet-200 bg-violet-200 text-white hover:bg-violet-400"
                                                                    : "border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:bg-violet-400 hover:text-white"
                                                                    }`}
                                                            >
                                                                {value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {method.method === "Account Transfer" && (
                                                <>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor={`beneficiary-currency-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Receiving Currency{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id={`beneficiary-currency-${index}`}
                                                            required
                                                            value={method.receivingCurrency}
                                                            onChange={(event) =>
                                                                updatePayoutMethod(
                                                                    index,
                                                                    "receivingCurrency",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className={inputClass}
                                                        >
                                                            {currencies.map((currency) => (
                                                                <option
                                                                    key={currency.code}
                                                                    value={currency.code}
                                                                >
                                                                    {currency.code} — {currency.name}
                                                                    {currency.code === "NGN"
                                                                        ? " · not currently sendable"
                                                                        : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor={`beneficiary-account-holder-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Account Holder Name{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            id={`beneficiary-account-holder-${index}`}
                                                            readOnly
                                                            required
                                                            value={fullName}
                                                            placeholder="Fills from the beneficiary's name"
                                                            className={`${inputClass} bg-slate-100`}
                                                        />
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            Taken from the beneficiary's name — edit that to change it.
                                                        </p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor={`beneficiary-account-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Account Number{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            id={`beneficiary-account-${index}`}
                                                            required
                                                            value={method.AccountNumber}
                                                            onChange={(event) =>
                                                                updatePayoutMethod(
                                                                    index,
                                                                    "AccountNumber",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="Enter account number"
                                                            className={inputClass}
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor={`beneficiary-bank-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Bank Name{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            id={`beneficiary-bank-${index}`}
                                                            required
                                                            value={method.BankName}
                                                            onChange={(event) =>
                                                                updatePayoutMethod(
                                                                    index,
                                                                    "BankName",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="Enter bank name"
                                                            className={inputClass}
                                                            autoComplete="organization"
                                                        />
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            Type the bank name manually.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor={`beneficiary-branch-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Branch Name{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            id={`beneficiary-branch-${index}`}
                                                            required
                                                            value={method.BranchName}
                                                            onChange={(event) =>
                                                                updatePayoutMethod(
                                                                    index,
                                                                    "BranchName",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    {form.country === "India" && (
                                                        <div>
                                                            <label
                                                                htmlFor={`beneficiary-ifsc-${index}`}
                                                                className={labelClass}
                                                            >
                                                                IFSC Code{" "}
                                                                <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                id={`beneficiary-ifsc-${index}`}
                                                                required
                                                                maxLength={11}
                                                                value={method.IFSC_Code}
                                                                onChange={(event) =>
                                                                    updatePayoutMethod(
                                                                        index,
                                                                        "IFSC_Code",
                                                                        event.target.value.toUpperCase()
                                                                    )
                                                                }
                                                                placeholder="e.g. ABCD0123456"
                                                                className={inputClass}
                                                                autoCapitalize="characters"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label
                                                            htmlFor={`beneficiary-account-type-${index}`}
                                                            className={labelClass}
                                                        >
                                                            Account Type{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id={`beneficiary-account-type-${index}`}
                                                            value={method.Account_Type}
                                                            onChange={(event) =>
                                                                updatePayoutMethod(
                                                                    index,
                                                                    "Account_Type",
                                                                    event.target.value as PayoutMethod["Account_Type"]
                                                                )
                                                            }
                                                            className={inputClass}
                                                        >
                                                            <option value="savings">Savings</option>
                                                            <option value="current">Current</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-slate-200 pt-5">
                                    <button
                                        type="button"
                                        onClick={addPayoutMethod}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                                    >
                                        + Add another payout method
                                    </button>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Save multiple payout options for this beneficiary.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {error && (
                            <p
                                role="alert"
                                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    onCancel
                                        ? onCancel()
                                        : navigate("/dashboard?tab=beneficiary")
                                }
                                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-violet-200 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? editBeneficiaryId
                                        ? "Saving..."
                                        : "Creating..."
                                    : editBeneficiaryId
                                        ? "Save Changes"
                                        : "Create Beneficiary"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

export default CreateBeneficiary;
