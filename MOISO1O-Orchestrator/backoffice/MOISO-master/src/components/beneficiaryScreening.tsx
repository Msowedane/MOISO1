import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CircleAlert,
    Clock3,
    CreditCard,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import {
    getFrontendBeneficiaries,
} from "../lib/frontendStore";

function BeneficiaryScreening() {
    const location = useLocation();
    const navigate = useNavigate();
    const beneficiaryId = new URLSearchParams(location.search).get(
        "beneficiaryId"
    );
    const beneficiary = useMemo(() => {
        if (!beneficiaryId) return undefined;
        return getFrontendBeneficiaries().find(
            (record) =>
                record.id === beneficiaryId ||
                record.beneficiaryId === beneficiaryId
        );
    }, [beneficiaryId]);

    const displayValue = (value: unknown) => {
        if (typeof value === "string" || typeof value === "number") {
            return String(value).trim() || "Not provided";
        }
        return "Not provided";
    };

    const primaryPayout = beneficiary?.payoutMethods[0];

    return (
        <main className="w-full">
            <div className="space-y-6">
                <header className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard?tab=beneficiary")}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Screening
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review beneficiary details and screening status.
                        </p>
                    </div>
                </header>

                {!beneficiary ? (
                    <section
                        role="alert"
                        className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
                    >
                        <p className="font-semibold">Beneficiary not found</p>
                        <p className="mt-1">
                            This screening view needs a beneficiary saved in this
                            browser. Return to the beneficiary list and select a
                            saved record.
                        </p>
                    </section>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <section className="space-y-6">
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                            <UserRound size={26} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">
                                                {displayValue(
                                                    beneficiary.beneficiaryName ??
                                                    beneficiary.name
                                                )}
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Beneficiary ID:{" "}
                                                {displayValue(
                                                    beneficiary.beneficiaryId
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
                                        <Clock3 size={15} />
                                        Not Screened
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                                    <Detail
                                        icon={<MapPin size={17} />}
                                        label="Country"
                                        value={beneficiary.country}
                                    />
                                    <Detail
                                        icon={<Mail size={17} />}
                                        label="Email"
                                        value={beneficiary.email ?? beneficiary.contactInfo}
                                    />
                                    <Detail
                                        icon={<Phone size={17} />}
                                        label="Mobile number"
                                        value={beneficiary.mobileNumber}
                                    />
                                    <Detail
                                        icon={<UserRound size={17} />}
                                        label="Relationship"
                                        value={beneficiary.relationship}
                                    />
                                </div>
                            </div>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck
                                        size={21}
                                        className="text-slate-600"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Compliance screening
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Screening result: Not Screened
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    <CircleAlert
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <p>
                                        This beneficiary is awaiting screening.
                                        No automated compliance provider is
                                        connected in this frontend-only flow, so
                                        no screening result has been generated.
                                    </p>
                                </div>
                            </section>
                        </section>

                        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Beneficiary details
                            </h2>
                            <div className="mt-5 space-y-5">
                                <Detail
                                    icon={<UserRound size={17} />}
                                    label="Beneficiary type"
                                    value={beneficiary.beneficiaryType}
                                />
                                <Detail
                                    icon={<Building2 size={17} />}
                                    label="Bank"
                                    value={primaryPayout?.BankName ?? beneficiary.BankName}
                                />
                                <Detail
                                    icon={<CreditCard size={17} />}
                                    label="Account number"
                                    value={
                                        primaryPayout?.AccountNumber ??
                                        beneficiary.accountNumber
                                    }
                                />
                                <Detail
                                    icon={<CreditCard size={17} />}
                                    label="Receiving currency"
                                    value={
                                        primaryPayout?.receivingCurrency ??
                                        beneficiary.receivingCurrency
                                    }
                                />
                                <Detail
                                    icon={<ShieldCheck size={17} />}
                                    label="Account status"
                                    value={beneficiary.status}
                                />
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

function Detail({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: unknown;
}) {
    const text =
        typeof value === "string" || typeof value === "number"
            ? String(value).trim() || "Not provided"
            : "Not provided";

    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-slate-400">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {text}
                </p>
            </div>
        </div>
    );
}

export default BeneficiaryScreening;
