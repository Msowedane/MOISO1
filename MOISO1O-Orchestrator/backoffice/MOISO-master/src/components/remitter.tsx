import { useEffect, useMemo, useState } from "react";
import { getFrontendRemitters } from "../lib/frontendStore";
import {
    Users,
    UserCheck,
    UserPlus,
    Clock,
    ShieldCheck,
    FileText,
    CheckCircle,
    XCircle,
    Search,
    Shield,
    RotateCcw,
} from "lucide-react";

// Type definitions
export type AccountStatus =
    | "Active"
    | "Pending"
    | "Suspended"
    | "Pending Invitation"
    | "Deleted";

export type KYCStatus =
    | "Verified"
    | "KYC Pending"
    | "Under Review"
    | "Rejected"
    | "Expired";

export type Activity =
    | "Active (used in 12 months)"
    | "Non Active (no use in 3 months)";

export type PEP = "PEP Only" | "Not a PEP";

export type Vulnerability =
    | "Vulnerable Only"
    | "Not Currently Flagged";

export type Country =
    | "All Countries"
    | "India"
    | "United States"
    | "United Kingdom"
    | "Canada"
    | "Australia"
    | "Germany"
    | "France"
    | "Singapore"
    | "Malaysia"
    | "United Arab Emirates"
    | "Saudi Arabia"
    | "Qatar"
    | "Kuwait"
    | "Oman"
    | "Bahrain"
    | "Pakistan"
    | "Bangladesh"
    | "Sri Lanka"
    | "Nepal"
    | "Philippines";

export type RemitterType = "All Types" | "Consumer" | "Business";

export type AgentType =
    | "All Remitters"
    | "Standard"
    | "White Label"
    | "Pay-in Partner"
    | "Direct Remitter"
    | "All Agent Remitters";

// Dropdown options
const accountStatuses: AccountStatus[] = [
    "Active",
    "Pending",
    "Suspended",
    "Pending Invitation",
    "Deleted",
];

const kycStatuses: KYCStatus[] = [
    "Verified",
    "KYC Pending",
    "Under Review",
    "Rejected",
    "Expired",
];

const activities: Activity[] = [
    "Active (used in 12 months)",
    "Non Active (no use in 3 months)",
];

const pepOptions: PEP[] = ["PEP Only", "Not a PEP"];

const vulnerabilityOptions: Vulnerability[] = [
    "Vulnerable Only",
    "Not Currently Flagged",
];

const countries: Country[] = [
    "All Countries",
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

const remitterTypes: RemitterType[] = [
    "All Types",
    "Consumer",
    "Business",
];

const agentTypes: AgentType[] = [
    "All Remitters",
    "Standard",
    "White Label",
    "Pay-in Partner",
    "Direct Remitter",
    "All Agent Remitters",
];

type RemitterProps = {
    onAddRemitter: () => void;
};

type RemitterRecord = {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountStatus: AccountStatus;
    kycStatus: KYCStatus;
    activity: Activity;
    pep: PEP;
    vulnerability: Vulnerability;
    country: string;
    remitterType: Exclude<RemitterType, "All Types">;
    agentType: Exclude<AgentType, "All Remitters" | "All Agent Remitters">;
};

type Filters = {
    accountStatus: string;
    kycStatus: string;
    activity: string;
    pep: string;
    vulnerability: string;
    country: string;
    remitterType: string;
    agentType: string;
};

const initialFilters: Filters = {
    accountStatus: "",
    kycStatus: "",
    activity: "",
    pep: "",
    vulnerability: "",
    country: "All Countries",
    remitterType: "All Types",
    agentType: "All Remitters",
};

function Remitter({ onAddRemitter }: RemitterProps) {
    const [remitters, setRemitters] = useState<RemitterRecord[]>([]);
    const [storageError, setStorageError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState<Filters>(initialFilters);

    useEffect(() => {
        try {
            setRemitters(
                getFrontendRemitters().map((remitter) => ({
                    id: remitter.id,
                    name: `${remitter.firstName} ${remitter.lastName}`.trim(),
                    email: remitter.email,
                    phone: remitter.mobileNumber,
                    accountStatus:
                        remitter.status === "ACTIVE" ? "Active" : "Suspended",
                    kycStatus: "KYC Pending",
                    activity: "Non Active (no use in 3 months)",
                    pep: "Not a PEP",
                    vulnerability: "Not Currently Flagged",
                    country: remitter.country,
                    remitterType:
                        remitter.remitterType === "Business"
                            ? "Business"
                            : "Consumer",
                    agentType: "Direct Remitter",
                }))
            );
        } catch (error) {
            setStorageError(
                error instanceof Error
                    ? error.message
                    : "Unable to load saved remitters."
            );
        }
    }, []);

    const updateFilter = (name: keyof Filters, value: string) => {
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetFilters = () => {
        setSearchTerm("");
        setAppliedSearch("");
        setFilters({ ...initialFilters });
        setAppliedFilters({ ...initialFilters });
    };

    const handleSearch = () => {
        setAppliedSearch(searchTerm.trim());
        setAppliedFilters({ ...filters });
    };

    const filteredRemitters = useMemo(() => {
        const query = appliedSearch.toLowerCase();

        return remitters.filter((remitter) => {
            const matchesSearch =
                !query ||
                remitter.name.toLowerCase().includes(query) ||
                remitter.email.toLowerCase().includes(query) ||
                remitter.phone.includes(query) ||
                remitter.id.toLowerCase().includes(query);

            const matchesAccount =
                !appliedFilters.accountStatus ||
                remitter.accountStatus === appliedFilters.accountStatus;

            const matchesKYC =
                !appliedFilters.kycStatus ||
                remitter.kycStatus === appliedFilters.kycStatus;

            const matchesActivity =
                !appliedFilters.activity ||
                remitter.activity === appliedFilters.activity;

            const matchesPEP =
                !appliedFilters.pep ||
                remitter.pep === appliedFilters.pep;

            const matchesVulnerability =
                !appliedFilters.vulnerability ||
                remitter.vulnerability === appliedFilters.vulnerability;

            const matchesCountry =
                appliedFilters.country === "All Countries" ||
                remitter.country === appliedFilters.country;

            const matchesType =
                appliedFilters.remitterType === "All Types" ||
                remitter.remitterType === appliedFilters.remitterType;

            const matchesAgent =
                appliedFilters.agentType === "All Remitters" ||
                appliedFilters.agentType === "All Agent Remitters" ||
                remitter.agentType === appliedFilters.agentType;

            return (
                matchesSearch &&
                matchesAccount &&
                matchesKYC &&
                matchesActivity &&
                matchesPEP &&
                matchesVulnerability &&
                matchesCountry &&
                matchesType &&
                matchesAgent
            );
        });
    }, [appliedSearch, appliedFilters]);

    const remitterCards = [
        {
            title: "Total Remitters",
            count: remitters.length,
            description: "All registered remitters",
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Active",
            count: remitters.filter(
                (item) => item.accountStatus === "Active"
            ).length,
            description: "Currently active",
            icon: UserCheck,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Non Active",
            count: remitters.filter(
                (item) => item.activity === "Non Active (no use in 3 months)"
            ).length,
            description: "Currently non-active",
            icon: UserPlus,
            color: "bg-violet-100 text-violet-600",
        },
        {
            title: "KYC Under Review",
            count: remitters.filter(
                (item) => item.kycStatus === "Under Review"
            ).length,
            description: "Awaiting approval",
            icon: Clock,
            color: "bg-amber-100 text-amber-600",
        },
        {
            title: "KYC Verified",
            count: remitters.filter(
                (item) => item.kycStatus === "Verified"
            ).length,
            description: "Identity verified",
            icon: ShieldCheck,
            color: "bg-emerald-100 text-emerald-600",
        },
        {
            title: "KYC Pending",
            count: remitters.filter(
                (item) => item.kycStatus === "KYC Pending"
            ).length,
            description: "Verification pending",
            icon: FileText,
            color: "bg-orange-100 text-orange-600",
        },
        {
            title: "Suspended",
            count: remitters.filter(
                (item) => item.accountStatus === "Suspended"
            ).length,
            description: "Suspended accounts",
            icon: CheckCircle,
            color: "bg-teal-100 text-teal-600",
        },
        {
            title: "KYC Rejected",
            count: remitters.filter(
                (item) => item.kycStatus === "Rejected"
            ).length,
            description: "Applications rejected",
            icon: Shield,
            color: "bg-red-100 text-red-600",
        },
        {
            title: "Deleted",
            count: remitters.filter(
                (item) => item.accountStatus === "Deleted"
            ).length,
            description: "Soft-deleted accounts",
            icon: XCircle,
            color: "bg-red-100 text-red-600",
        },
    ];

    const selectClass =
        "w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200";

    const filtersList = [
        {
            name: "accountStatus",
            label: "Account Status",
            placeholder: "All Status",
            options: accountStatuses,
        },
        {
            name: "kycStatus",
            label: "KYC Status",
            placeholder: "All KYC Status",
            options: kycStatuses,
        },
        {
            name: "activity",
            label: "Activity",
            placeholder: "All Activity",
            options: activities,
        },
        {
            name: "pep",
            label: "PEP Status",
            placeholder: "All PEP Status",
            options: pepOptions,
        },
        {
            name: "vulnerability",
            label: "Vulnerability",
            placeholder: "All Vulnerability",
            options: vulnerabilityOptions,
        },
        {
            name: "country",
            label: "Country",
            placeholder: "All Countries",
            options: countries,
        },
        {
            name: "remitterType",
            label: "Remitter Type",
            placeholder: "All Types",
            options: remitterTypes,
        },
        {
            name: "agentType",
            label: "Agent Type",
            placeholder: "All Remitters",
            options: agentTypes,
        },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Remitter
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage and monitor all registered remitters.
                    </p>
                </div>

                <button
                    onClick={onAddRemitter}
                    type="button"
                    className="rounded-lg bg-violet-200 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-400"
                >
                    + Add Remitter
                </button>
            </div>

            {storageError && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {storageError}
                </p>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                {remitterCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.title}
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                        {card.count}
                                    </h2>
                                </div>

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                                >
                                    <Icon size={18} />
                                </div>
                            </div>

                            <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </div>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Search & Filter Remitters
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Search remitters and filter by account details.
                    </p>
                </div>
                <form
                    className="mb-6 flex flex-col gap-3 sm:flex-row"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSearch();
                    }}
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by name, email, phone or remitter ID..."
                            className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-lg bg-violet-200 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
                    >
                        <Search size={16} />
                        Search
                    </button>
                </form>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filtersList.map((filter) => (
                        <div key={filter.name}>
                            <label
                                htmlFor={filter.name}
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                {filter.label}
                            </label>

                            <select
                                id={filter.name}
                                value={filters[filter.name]}
                                onChange={(event) =>
                                    updateFilter(
                                        filter.name,
                                        event.target.value
                                    )
                                }
                                className={selectClass}
                            >
                                <option
                                    value={
                                        filter.name === "country"
                                            ? "All Countries"
                                            : filter.name === "remitterType"
                                                ? "All Types"
                                                : filter.name === "agentType"
                                                    ? "All Remitters"
                                                    : ""
                                    }
                                >
                                    {filter.placeholder}
                                </option>

                                {filter.options
                                    .filter(
                                        (item) =>
                                            item !== filter.placeholder
                                    )
                                    .map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                        <RotateCcw size={15} aria-hidden="true" />
                        Clear All
                    </button>
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full rounded-lg bg-violet-200 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 sm:w-auto"
                    >
                        Apply Filters
                    </button>
                </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Remitter List
                    </h2>
                    <span className="text-sm text-slate-500">
                        {filteredRemitters.length} of {remitters.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                        <colgroup>
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "14.2857%" }} />
                            <col style={{ width: "14.2857%" }} />
                            <col style={{ width: "14.2857%" }} />
                            <col style={{ width: "14.2857%" }} />
                            <col style={{ width: "14.2857%" }} />
                            <col style={{ width: "10%" }} />
                        </colgroup>
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                {[
                                    "Remitter ID",
                                    "Name",
                                    "Type",
                                    "Agent",
                                    "Affiliate",
                                    "Contact",
                                    "KYC Status",
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="whitespace-nowrap px-3 py-3 text-left font-medium text-base first:pl-5 last:pr-5"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRemitters.length > 0 ? (
                                filteredRemitters.map((remitter) => (
                                    <tr
                                        key={remitter.id}
                                        className="border-t border-slate-200 hover:bg-slate-50"
                                    >
                                        <td className="px-3 py-3 text-left text-slate-700 first:pl-5 last:pr-5">
                                            <span className="block truncate" title={remitter.id}>
                                                {remitter.id}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-left first:pl-5 last:pr-5">
                                            <div className="truncate font-medium text-slate-900" title={remitter.name}>
                                                {remitter.name}
                                            </div>
                                            <div className="truncate text-xs text-slate-500" title={remitter.country}>
                                                {remitter.country}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-left text-slate-700 first:pl-5 last:pr-5">
                                            {remitter.remitterType}
                                        </td>
                                        <td className="px-3 py-3 text-left text-slate-700 first:pl-5 last:pr-5">
                                            {remitter.agentType}
                                        </td>
                                        <td className="px-3 py-3 text-left text-slate-700 first:pl-5 last:pr-5">
                                            {remitter.accountStatus}
                                        </td>
                                        <td className="px-3 py-3 text-left text-slate-700 first:pl-5 last:pr-5">
                                            <div className="truncate" title={remitter.email}>{remitter.email}</div>
                                            <div className="truncate text-xs text-slate-500" title={remitter.phone}>
                                                {remitter.phone}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-left first:pl-5 last:pr-5">
                                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                {remitter.kycStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="h-32 px-3 py-10 text-center text-sm text-slate-500"
                                    >
                                        {/* No remitters match the current search and filters. */}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Remitter;