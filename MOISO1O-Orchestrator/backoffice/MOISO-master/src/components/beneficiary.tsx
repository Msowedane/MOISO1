import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
    deleteFrontendBeneficiary,
    getFrontendBeneficiaries,
} from "../lib/frontendStore";
import {
    Ban,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Search,
    ShieldCheck,
    Users,
    UserX,
    Eye,
    Pencil,
} from "lucide-react";
type BeneficiaryRecord = {
    _id?: string;
    id?: string | number;
    beneficiaryId?: string | number;
    beneficiaryName?: string;
    name?: string;
    remitterId?: string | number;
    country?: string;
    bankAccount?: string;
    accountNumber?: string;
    account_number?: string;
    contactInfo?: string;
    relationship?: string;
    totalReceived?: string | number;
    status?: string;
    screening?: string;
    [key: string]: unknown;
};

type BeneficiaryProps = {
    beneficiaries?: BeneficiaryRecord[];
    onAddBeneficiary?: () => void;
    onScreenBeneficiary?: (beneficiaryId: string) => void;
    onEditBeneficiary?: (beneficiaryId: string) => void;
};

const PAGE_SIZE = 5;

const statusOptions = [
    "Active",
    "In Active",
    "Blocked",
    "Deleted",
];

const countryOptions = [
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

function Beneficiary({
    beneficiaries: initialBeneficiaries = [],
    onAddBeneficiary,
    onScreenBeneficiary,
    onEditBeneficiary,
}: BeneficiaryProps) {
    const [savedBeneficiaries, setSavedBeneficiaries] = useState<BeneficiaryRecord[]>([]);
    const [storageError, setStorageError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [countryFilter, setCountryFilter] = useState("All Countries");
    const [page, setPage] = useState(1);

    useEffect(() => {
        try {
            setSavedBeneficiaries(getFrontendBeneficiaries());
        } catch (error) {
            setStorageError(
                error instanceof Error
                    ? error.message
                    : "Unable to load saved beneficiaries."
            );
        }
    }, []);

    const beneficiaries = useMemo(
        () => [...savedBeneficiaries, ...initialBeneficiaries],
        [initialBeneficiaries, savedBeneficiaries]
    );

    const statuses = useMemo(
        () =>
            Array.from(new Set([
                ...statusOptions,
                ...beneficiaries
                    .map((beneficiary) => beneficiary.status)
                    .filter(
                        (value): value is string =>
                            typeof value === "string" && value.trim() !== ""
                    ),
            ])),
        [beneficiaries]
    );

    const countries = useMemo(
        () =>
            Array.from(new Set([
                ...countryOptions,
                ...beneficiaries
                    .map((beneficiary) => beneficiary.country)
                    .filter(
                        (value): value is string =>
                            typeof value === "string" && value.trim() !== ""
                    ),
            ])),
        [beneficiaries]
    );
    const filteredBeneficiaries = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return beneficiaries.filter((beneficiary) => {
            const matchesSearch =
                !query ||
                Object.values(beneficiary)
                    .filter(
                        (value) =>
                            typeof value === "string" ||
                            typeof value === "number" ||
                            typeof value === "boolean"
                    )
                    .some((value) => String(value).toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === "All Statuses" ||
                beneficiary.status === statusFilter;
            const matchesCountry =
                countryFilter === "All Countries" ||
                beneficiary.country === countryFilter;

            return matchesSearch && matchesStatus && matchesCountry;
        });
    }, [beneficiaries, countryFilter, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredBeneficiaries.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(totalPages, 1));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentItems = filteredBeneficiaries.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const updateSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const updateStatus = (event: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
        setPage(1);
    };

    const updateCountry = (event: ChangeEvent<HTMLSelectElement>) => {
        setCountryFilter(event.target.value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("All Statuses");
        setCountryFilter("All Countries");
        setPage(1);
    };

    const removeBeneficiary = (beneficiary: BeneficiaryRecord) => {
        const storageId = String(beneficiary.id ?? beneficiary.beneficiaryId ?? "");

        if (!storageId) {
            setStorageError("Unable to delete beneficiary: its ID is missing.");
            return;
        }
        if (
            !window.confirm(
                `Delete ${displayValue(beneficiary.beneficiaryName ?? beneficiary.name)}? This cannot be undone.`
            )
        ) {
            return;
        }

        try {
            deleteFrontendBeneficiary(storageId);
            setSavedBeneficiaries((current) =>
                current.filter((record) => record.id !== storageId)
            );
            setStorageError("");
            if (currentItems.length === 1 && currentPage > 1) {
                setPage(currentPage - 1);
            }
        } catch (error) {
            setStorageError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete beneficiary."
            );
        }
    };

    const displayValue = (value: unknown) => {
        if (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "")
        ) {
            return "-";
        }

        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return String(value);
        }

        return "-";
    };

    const summaryCards = [
        {
            title: "Total Beneficiaries",
            count: beneficiaries.length,
            description: "All registered beneficiaries",
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Active",
            count: beneficiaries.filter(
                (beneficiary) =>
                    beneficiary.status?.toLowerCase() === "active"
            ).length,
            description: "Currently active",
            icon: ShieldCheck,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "In Active",
            count: beneficiaries.filter((beneficiary) => {
                const status = beneficiary.status?.trim().toLowerCase();
                return status === "in active" || status === "inactive";
            }).length,
            description: "Currently inactive",
            icon: UserX,
            color: "bg-violet-100 text-violet-600",
        },
        {
            title: "Blocked",
            count: beneficiaries.filter(
                (beneficiary) =>
                    beneficiary.status?.toLowerCase() === "blocked"
            ).length,
            description: "Currently blocked",
            icon: Ban,
            color: "bg-orange-100 text-orange-600",
        },
        {
            title: "Deleted",
            count: beneficiaries.filter(
                (beneficiary) =>
                    beneficiary.status?.toLowerCase() === "deleted"
            ).length,
            description: "Removed beneficiaries",
            icon: Trash2,
            color: "bg-red-100 text-red-600",
        },
    ];

    const selectClass =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200";

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Beneficiary
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage and monitor all registered beneficiaries.
                    </p>
                </div>

                <button
                    onClick={onAddBeneficiary}
                    type="button"
                    className="rounded-lg bg-violet-200 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-400"
                >
                    + Add Beneficiary
                </button>
            </div>

            {storageError && (
                <p
                    role="alert"
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {storageError}
                </p>
            )}

            <div className="grid grid-cols-5 gap-3 sm:gap-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.title}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
                                        {card.count}
                                    </h2>
                                </div>
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${card.color}`}
                                >
                                    <Icon size={15} />
                                </div>
                            </div>
                            <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500 sm:mt-4">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Search &amp; Filter Beneficiaries
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Search beneficiaries and filter by status or country.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label
                            htmlFor="beneficiary-search"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Search
                        </label>
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                id="beneficiary-search"
                                type="search"
                                value={searchTerm}
                                onChange={updateSearch}
                                placeholder="Search by name, beneficiary ID, remitter or bank..."
                                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="beneficiary-status"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Status
                        </label>
                        <select
                            id="beneficiary-status"
                            value={statusFilter}
                            onChange={updateStatus}
                            className={selectClass}
                        >
                            <option>All Statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="beneficiary-country"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Country
                        </label>
                        <select
                            id="beneficiary-country"
                            value={countryFilter}
                            onChange={updateCountry}
                            className={selectClass}
                        >
                            <option>All Countries</option>
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="w-full rounded-lg bg-violet-200 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 sm:w-auto"
                    >
                        Clear Filters
                    </button>
                </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Beneficiary List
                    </h2>
                    <span className="text-sm text-slate-500">
                        {filteredBeneficiaries.length} of {beneficiaries.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                {[
                                    "Beneficiary ID",
                                    "Name",
                                    "Remitter ID",
                                    "Country",
                                    "Bank Account",
                                    "Contact Info",
                                    "Relationship",
                                    "Total Received",
                                    "Status",
                                    "Screening",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-5 py-3 text-lg font-medium"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((beneficiary, index) => (
                                <tr
                                    key={
                                        beneficiary._id ??
                                        beneficiary.id ??
                                        beneficiary.beneficiaryId ??
                                        `${startIndex + index}`
                                    }
                                    className="transition hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                        {displayValue(
                                            beneficiary.beneficiaryId ??
                                            beneficiary._id ??
                                            beneficiary.id
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                        {displayValue(
                                            beneficiary.beneficiaryName ??
                                            beneficiary.name
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.remitterId)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.country)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(
                                            beneficiary.bankAccount ??
                                            beneficiary.accountNumber ??
                                            beneficiary.account_number
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.contactInfo)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.relationship)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.totalReceived)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.status)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {displayValue(beneficiary.screening)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onScreenBeneficiary?.(
                                                        String(
                                                            beneficiary.beneficiaryId ??
                                                            beneficiary._id ??
                                                            beneficiary.id ??
                                                            ""
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    !(
                                                        beneficiary.beneficiaryId ??
                                                        beneficiary._id ??
                                                        beneficiary.id
                                                    )
                                                }
                                                className="font-medium text-violet-600 transition hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye size={15} />
                                                    View
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEditBeneficiary?.(
                                                        String(
                                                            beneficiary.beneficiaryId ??
                                                            beneficiary.id ??
                                                            ""
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    !(
                                                        beneficiary.beneficiaryId ??
                                                        beneficiary.id
                                                    )
                                                }
                                                className="inline-flex items-center gap-1 font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeBeneficiary(beneficiary)}
                                                className="inline-flex items-center gap-1 font-medium text-red-600 transition hover:text-red-800"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {currentItems.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-5 py-10 text-center text-slate-500"
                                    >
                                        No beneficiaries available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 p-4 sm:p-5">
                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        {filteredBeneficiaries.length === 0 ? 0 : startIndex + 1}
                        {" - "}
                        {Math.min(startIndex + PAGE_SIZE, filteredBeneficiaries.length)}
                        {" of "}
                        {filteredBeneficiaries.length} beneficiaries
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(current - 1, 1))}
                            disabled={currentPage <= 1}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span className="text-sm text-slate-700">
                            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(current + 1, totalPages)
                                )
                            }
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Beneficiary;
