import { useState } from "react";
import {
    Check,
    ClipboardCheck,
    CreditCard,
    X,
    UserRound,
} from "lucide-react";

type TransactionSummaryProps = {
    remitter: string;
    beneficiary: string;
    destinationCountry: string;
    payoutMethod: string;
    sourceCountry: string;
    sourceCurrency: string;
    destinationCurrency: string;
    sendAmount: string;
    recipientAmount: string;
    sourceOfIncome: string;
    paymentMethod: string;
    paymentPurpose: string;
    purposeDescription: string;
    adminNotes: string;
    confirmed: boolean;
    onConfirmChange: (confirmed: boolean) => void;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="break-words text-sm font-medium text-slate-900 sm:text-right">
                {value.trim() || "Not provided"}
            </dd>
        </div>
    );
}

function TransactionSummary({
    remitter,
    beneficiary,
    destinationCountry,
    payoutMethod,
    sourceCountry,
    sourceCurrency,
    destinationCurrency,
    sendAmount,
    recipientAmount,
    sourceOfIncome,
    paymentMethod,
    paymentPurpose,
    purposeDescription,
    adminNotes,
    confirmed,
    onConfirmChange,
}: TransactionSummaryProps) {
    const [paymentResult, setPaymentResult] = useState<
        "done" | "declined" | null
    >(null);
    const [resultModalOpen, setResultModalOpen] = useState(false);

    const safeAmount = (amount: string, currency: string) => {
        const numericAmount = Number(amount);
        return amount.trim() && Number.isFinite(numericAmount)
            ? `${currency} ${numericAmount.toFixed(2)}`
            : `${currency} 0.00`;
    };

    return (
        <section className="w-full space-y-6">
            <header className="flex items-center gap-3">
                <ClipboardCheck size={23} className="text-slate-900" />
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Transaction Summary
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Review the payment details before confirming.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                        <UserRound size={20} />
                        Remitter &amp; Beneficiary
                    </h3>
                    <dl className="mt-3">
                        <SummaryRow label="Sender" value={remitter} />
                        <SummaryRow label="Recipient" value={beneficiary} />
                        <SummaryRow
                            label="Destination country"
                            value={destinationCountry}
                        />
                        <SummaryRow label="Payout method" value={payoutMethod} />
                    </dl>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                        <CreditCard size={20} />
                        Transfer amount
                    </h3>
                    <dl className="mt-3">
                        <SummaryRow
                            label="Source"
                            value={`${sourceCountry} · ${sourceCurrency}`}
                        />
                        <SummaryRow
                            label="Send amount"
                            value={safeAmount(sendAmount, sourceCurrency)}
                        />
                        <SummaryRow
                            label="Recipient gets"
                            value={safeAmount(recipientAmount, destinationCurrency)}
                        />
                    </dl>
                </section>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-900">
                    Purpose &amp; Notes
                </h3>
                <dl className="mt-3">
                    <SummaryRow label="Source of income" value={sourceOfIncome} />
                    <SummaryRow label="Payment method" value={paymentMethod} />
                    <SummaryRow label="Purpose of payment" value={paymentPurpose} />
                    <SummaryRow
                        label="Purpose description"
                        value={purposeDescription}
                    />
                    <SummaryRow label="Admin notes" value={adminNotes} />
                </dl>
            </section>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 bg-white p-4">
                <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) =>
                        onConfirmChange(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-slate-700"
                />
                <span className="text-sm text-slate-700">
                    I confirm the transaction amount and details shown above are correct.
                </span>
            </label>

            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    disabled={!confirmed}
                    onClick={() => {
                        setPaymentResult("declined");
                        setResultModalOpen(true);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Cancel  Payment
                </button>
                <button
                    type="button"
                    disabled={!confirmed}
                    onClick={() => {
                        setPaymentResult("done");
                        setResultModalOpen(true);
                    }}
                    className="rounded-lg border border-violet-200 bg-violet-200 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Confirm   Payment
                </button>
            </div>

            {/* {paymentResult && (
                <p
                    role="status"
                    className={`text-sm font-medium ${paymentResult === "done" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    Payment status:{" "}
                    {paymentResult === "done" ? "Done" : "Declined"}
                </p>
            )} */}

            {paymentResult && resultModalOpen && (
                <div
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setResultModalOpen(false);
                        }
                    }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-result-title"
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${paymentResult === "done"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {paymentResult === "done" ? (
                                    <Check size={22} strokeWidth={3} className="bg-green" />
                                ) : (
                                    <X size={22} />
                                )}
                            </div>
                            <div>
                                <h2
                                    id="payment-result-title"
                                    className={`text-lg font-semibold ${paymentResult === "done"
                                        ? "text-black-600"
                                        : "text-black-600"
                                        }`}
                                >
                                    {paymentResult === "done"
                                        ? "Payment Successful"
                                        : "Cancel Payment"}
                                </h2>
                                {/* <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {paymentResult === "done"
                                        ? "The transaction has been marked as paid."
                                        : "The transaction has been marked as declined."}
                                </p> */}
                                {/* <p className="mt-2 text-xs leading-5 text-slate-500">
                                    This is a frontend status only. No payment provider was contacted.
                                </p> */}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setResultModalOpen(false)}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}

export default TransactionSummary;