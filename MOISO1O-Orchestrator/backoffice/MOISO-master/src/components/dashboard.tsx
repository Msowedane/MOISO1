import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import HeaderPage from "./header";
import TransactionChart from "./transcationVolume";
import PieWithGradient from "./chart";
import { XELiveRatesWidget } from "./liverates";
import QuickRate from "./quickRate";

function Dashboard() {
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false);
  const [daysOpen, setDaysOpen] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>("Last 7 Days");
  useEffect(() => {
    toast.success("Login Successful!", {
      position: "bottom-right",
      autoClose: 1000,
      toastId: "login-success",
    });
  }, []);

  const currencies = [
    "GBP/INR",
    "GBP/USD",
    "GBP/EUR",
    "GBP/AUD",
    "GBP/CAD",
    "GBP/SGD",
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const visibleCurrencies = currencies.slice(
    currentSlide * 3,
    currentSlide * 3 + 3
  );
  const quickActions: string[] = [
    "Pending Remitters",
    "Active Remitters",
    "KYC Pending",
    "Pending Transactions",
    "Compliance Checks",
    "In Progress Transactions",
    "Unassigned Transactions",
    "Credit Requests",
    "Open Tickets",
    "Profile Change Requests",
    "Compliance Alerts",
    "Beneficiary Screening",
    "Create Transactions",
    "View Reports",
  ];
  const days: string[] = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Year",
    "Custom Range",
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer />

      <HeaderPage />

      <main className="mx-auto w-full px-5 py-4 sm:px-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="flex w-64 shrink-0 flex-col items-start gap-6" style={{ paddingTop: "18px" }}>
            <h1 className="text-lg">Dashboard</h1>
            <h1>Transactions</h1>
            <h1>Remitter</h1>
            <h1>Remitter Transactions</h1>
            <h1>Beneficiary</h1>
            <h1>Direct Transfers and Fees</h1>
            <h1>Compliance</h1>
            <h1>Configurations</h1>
          </aside>

          {/* Main Dashboard Content */}
          <section className="min-w-0 flex-1">
            {/* Welcome and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Welcome to the Dashboard
              </h1>

              <div className="py-4">
                {/* Top buttons stay in position */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Actions */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setQuickActionsOpen((prev) => !prev)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Quick Actions
                      <ChevronDown size={16} />
                    </button>

                    {/* Align the menu to the trigger's right edge so it opens toward the left. */}
                    {quickActionsOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(700px,calc(100vw-2rem))] flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                        {quickActions.map((action: string) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setQuickActionsOpen(false)}
                            className="shrink-0 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-violet-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      aria-expanded={daysOpen}
                      onClick={() => setDaysOpen((prev) => !prev)}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      {selectedDay}
                      <ChevronDown size={16} />
                    </button>
                    {daysOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(120px,calc(100vw-2rem))] flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg text-sm">
                        {days.map((day: string) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setSelectedDay(day);
                              setDaysOpen(false);
                            }}
                            className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            </div>
            {/* transcations */}
            <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-800 text-xl pb-6">Total Transactions</h2>
                <p className="mt-1 text-2xl font-semibold text-slate-900">0</p>
                <p className="mt-1 text-xs text-emerald-600">↑ 0 delivered</p>
                <hr className="my-4 border-slate-200" />
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between">Direct USI: <span className="font-medium">0</span></p>
                  <p className="flex justify-between">White Label: <span className="font-medium">0</span></p>
                  <p className="flex justify-between">Pay-in Partner: <span className="font-medium">0</span></p>
                </div>

              </div>

              {/* Total Volume */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-800 text-xl pb-6">Total Volume</h2>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  £0.00
                </p>
                <p className="mt-1 text-xs text-emerald-600 ">
                  ↑ £0.00 delivered
                </p>
                <hr className="my-4 border-slate-200" />
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between">
                    Direct USI: <span className="font-medium">£0.00</span>
                  </p>
                  <p className="flex justify-between">
                    White Label: <span className="font-medium">£0.00</span>
                  </p>
                  <p className="flex justify-between">
                    Pay-in Partner: <span className="font-medium">£0.00</span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-800 text-xl pb-6">Active Agents</h2>
                <p className="mt-1 text-2xl font-semibold text-slate-900">0</p>
                <p className="mt-1 text-xs text-emerald-600">
                  ↑ 0 enabled
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                <h2 className="font-bold text-slate-800 text-xl pb-6">Compliance Checks</h2>
                <p className="mt-1 text-2xl font-semibold text-slate-900">0</p>
                <p className="mt-1 text-xs text-emerald-600">
                  ↑ 0 cleared
                </p>
              </div>
            </section>
            {/* transcation Volumes */}
            <section className="grid grid-cols-1 items-stretch gap-4 py-4 lg:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
                <TransactionChart />
              </div>
              <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
                <PieWithGradient />
              </div>
            </section>
            <section className="py-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Currency Exchange
                </h2>
              </div>

              {/* Cards */}
              <div className="relative">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleCurrencies.map((currency) => (
                    <div
                      key={currency}
                      className="h-[300px] rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
                    >
                      <p className="font-semibold">{currency}</p>
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide(0)}
                    disabled={currentSlide === 0}
                    aria-label="Previous slide"
                    className="pointer-events-auto rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentSlide(1)}
                    disabled={currentSlide === 1}
                    aria-label="Next slide"
                    className="pointer-events-auto rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Centered slide dots */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {[0, 1].map((slide) => (
                  <button
                    key={slide}
                    type="button"
                    onClick={() => setCurrentSlide(slide)}
                    aria-label={`Go to slide ${slide + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === slide
                      ? "w-6 bg-violet-600"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                  />
                ))}
              </div>
            </section>
            <section className="mt-6">
              <XELiveRatesWidget />
            </section>
            <section className="mt-6">
              <div>
                <QuickRate />
              </div>
            </section>
            {/* Dashboard Content */}
            <div />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
