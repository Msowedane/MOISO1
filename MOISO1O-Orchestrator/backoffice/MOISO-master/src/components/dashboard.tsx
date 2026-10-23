import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import HeaderPage from "./header";
import TransactionChart from "./transcationVolume";
import PieWithGradient from "./chart";
import { XELiveRatesWidget } from "./liverates";
import QuickRate from "./quickRate";
import Transactions from "./transactions/transactions";

type DashboardPage =
  | "Dashboard"
  | "Transactions"
  | "Remitter"
  | "Remitter Transactions"
  | "Beneficiary"
  | "Direct Transfers and Fees"
  | "Overview"
  | "System Rates"
  | "Approval Queue"
  | "Compliance"
  | "EDD Cases"
  | "Training"
  | "Policies"
  | "Configurations";


function Dashboard() {
  const [activePage, setActivePage] = useState<DashboardPage>("Dashboard");
  const [openMenu, setOpenMenu] = useState<"rates" | "compliance" | null>(null);
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
  const handleButton = (page: DashboardPage) => setActivePage(page);
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
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <aside className="flex w-64 shrink-0 flex-col gap-2 self-stretch border-r border-slate-200 bg-transpart p-2">
            <button
              type="button"
              aria-current={activePage === "Dashboard" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Dashboard" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              aria-current={activePage === "Transactions" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Transactions" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Transactions")}
            >
              Transactions
            </button>
            <button
              type="button"
              aria-current={activePage === "Remitter" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Remitter" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Remitter")}
            >
              Remitter
            </button>
            <button
              type="button"
              aria-current={activePage === "Remitter Transactions" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Remitter Transactions" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Remitter Transactions")}
            >
              Remitter Transactions
            </button>
            <button
              type="button"
              aria-current={activePage === "Beneficiary" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Beneficiary" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Beneficiary")}
            >
              Beneficiary
            </button>
            <div>
              <button
                type="button"
                aria-expanded={openMenu === "rates"}
                aria-current={activePage === "Direct Transfers and Fees" ? "page" : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Direct Transfers and Fees" ? "bg-[#b589d6] text-white" : "text-slate-900 hover:bg-violet-100"}`}
                onClick={() => {
                  setOpenMenu((current) => current === "rates" ? null : "rates");
                  handleButton("Direct Transfers and Fees");
                }}
              >
                <span>Direct Transfers and Fees</span>
                <ChevronDown size={16} className={`shrink-0 transition-transform ${openMenu === "rates" ? "rotate-180" : ""}`} />
              </button>
              {openMenu === "rates" && (
                <nav aria-label="Direct Transfers and Fees" className="mt-1 space-y-1 border-l border-violet-200 pl-3">
                  {(["Overview", "System Rates", "Approval Queue"] as const).map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={activePage === page ? "page" : undefined}
                      onClick={() => handleButton(page)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === page ? "bg-violet-100 font-semibold text-violet-800" : "text-slate-600 hover:bg-violet-200 hover:text-slate-900"}`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            <div>
              <button
                type="button"
                aria-expanded={openMenu === "compliance"}
                aria-current={activePage === "Compliance" ? "page" : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Compliance" ? "bg-[#b589d6] text-white" : "text-slate-900 hover:bg-violet-100"}`}
                onClick={() => {
                  setOpenMenu((current) => current === "compliance" ? null : "compliance");
                  handleButton("Compliance");
                }}
              >
                <span>Compliance</span>
                <ChevronDown size={16} className={`shrink-0 transition-transform ${openMenu === "compliance" ? "rotate-180" : ""}`} />
              </button>
              {openMenu === "compliance" && (
                <nav aria-label="Compliance" className="mt-1 space-y-1 border-l border-violet-200 pl-3">
                  {(["Overview", "EDD Cases", "Training", "Policies"] as const).map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={activePage === page ? "page" : undefined}
                      onClick={() => handleButton(page)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === page ? "bg-violet-100 font-semibold text-violet-800" : "text-slate-600 hover:bg-violet-200 hover:text-slate-900"}`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            <button
              type="button"
              aria-current={activePage === "Configurations" ? "page" : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${activePage === "Configurations" ? "bg-[#b589d6] text-white" : "bg-tranpart text-slate-900 hover:bg-violet-200"}`}
              onClick={() => handleButton("Configurations")}
            >
              Configurations
            </button>
          </aside>

          {/* Main Dashboard Content */}
          <section className="min-w-0 flex-1">
            {activePage === "Dashboard" ? (
              <>
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
              </>
            ) : activePage === "Transactions" ? (
              <Transactions />
            ) : (
              <div className="min-h-[calc(100vh-10rem)] rounded-xl border border-slate-200 bg-white p-8">
                <h1 className="text-2xl font-semibold text-slate-900">{activePage}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  The {activePage} page is ready to be added here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
