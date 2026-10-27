import { useState } from "react";
import { Users } from "lucide-react";

function RemitterTransactions() {
    const [activeTab, setActiveTab] = useState("Pending");

    const tabs = ["Pending", "Approved", "Declined", "All"];
    const emptyMessages: Record<string, string> = {
        Pending: "There are no remitter transactions awaiting review.",
        Approved: "There are no approved remitter transactions.",
        Declined: "There are no declined remitter transactions.",
        All: "No remitter transactions have been found.",
    };

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Remitter Transactions
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Review and manage remitter transaction requests.
                </p>
            </header>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                    <Users aria-hidden="true" className="h-5 w-5 text-black-200" />
                    <h2 className="text-lg font-semibold text-slate-900">
                        Requests
                    </h2>
                </div>

                <div className="border-b border-slate-200 px-5 pt-4">
                    <div
                        aria-label="Transaction request status"
                        className="flex flex-wrap gap-2"
                        role="tablist"
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                id={`remitter-transactions-${tab.toLowerCase()}-tab`}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab}
                                aria-controls="remitter-transactions-panel"
                                onClick={() => setActiveTab(tab)}
                                className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab
                                    ? "border-violet-600 text-violet-200"
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    id="remitter-transactions-panel"
                    role="tabpanel"
                    aria-labelledby={`remitter-transactions-${activeTab.toLowerCase()}-tab`}
                    className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"
                >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
                        <Users
                            aria-hidden="true"
                            className="h-6 w-6 text-violet-500"
                        />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                        No {activeTab.toLowerCase()} requests
                    </h3>
                    <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                        {emptyMessages[activeTab]}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default RemitterTransactions;
