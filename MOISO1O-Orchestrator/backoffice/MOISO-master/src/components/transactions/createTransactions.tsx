import { useNavigate } from "react-router-dom";

function CreateTransactions() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
            <section className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mb-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                >
                    Back to dashboard
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Create Transaction</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Start a new remittance transaction.
                </p>
            </section>
        </main>
    )
}

export default CreateTransactions