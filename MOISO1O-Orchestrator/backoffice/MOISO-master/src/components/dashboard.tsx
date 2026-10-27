import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import HeaderPage from "./header";
import TransactionChart from "./transcationVolume";
import PieWithGradient from "./chart";
import { XELiveRatesWidget } from "./liverates";
import QuickRate from "./quickRate";
import Transactions from "./transactions/transactions";
import CreateTransactions from "./transactions/createTransactions";
import CreateBeneficiary from "./createBeneficiary";
import CreateRemitter from "./createremitter";
import Remitter from "./remitter";
import Beneficiary from "./beneficiary";
import BeneficiaryScreening from "./beneficiaryScreening";
import RemitterTransactions from "./remitterTransactions";

type DashboardPage =
  | "Dashboard"
  | "Transactions"
  | "Refunds"
  | "Create Transaction"
  | "Create Beneficiary"
  | "Create Remitter"
  | "Remitter"
  | "Remitter Transactions"
  | "Beneficiary"
  | "Beneficiary Screening"
  | "Direct Transfers and Fees"
  | "Reports"
  | "Overview"
  | "System Rates"
  | "Approval Queue"
  | "Compliance"
  | "EDD Cases"
  | "Training"
  | "Policies"
  | "Configurations";

const dashboardPageTabs: Record<DashboardPage, string> = {
  Dashboard: "dashboard",
  Transactions: "transactions",
  Refunds: "refunds",
  "Create Transaction": "create-transaction",
  "Create Beneficiary": "create-beneficiary",
  "Create Remitter": "create-remitter",
  Remitter: "remitters",
  "Remitter Transactions": "remitter-transactions",
  Beneficiary: "beneficiary",
  "Beneficiary Screening": "beneficiary-screening",
  "Direct Transfers and Fees": "direct-transfers-and-fees",
  Reports: "reports",
  Overview: "overview",
  "System Rates": "system-rates",
  "Approval Queue": "approval-queue",
  Compliance: "compliance",
  "EDD Cases": "edd-cases",
  Training: "training",
  Policies: "policies",
  Configurations: "configurations",
};

function getDashboardPage(pathname: string, search: string): DashboardPage {
  if (pathname === "/createremitter") return "Create Remitter";
  if (pathname === "/create-beneficiary") return "Create Beneficiary";
  if (pathname === "/create-transaction" || pathname === "/createtransactions") {
    return "Create Transaction";
  }

  const tab = new URLSearchParams(search).get("tab");
  return (
    (Object.keys(dashboardPageTabs) as DashboardPage[]).find(
      (page) => dashboardPageTabs[page] === tab
    ) ?? "Dashboard"
  );
}

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getDashboardPage(location.pathname, location.search);

  const [openMenu, setOpenMenu] = useState<"rates" | "compliance" | null>(null);

  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Last 7 Days");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!location.state?.loginSuccess) return;

    toast.success("Login Successful!", {
      position: "bottom-right",
      autoClose: 1000,
      toastId: "login-success",
    });

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);
  const handleToggle = (page: DashboardPage) => {
    if (page === "Create Remitter") {
      navigate("/createremitter");
      return;
    }

    if (page === "Create Transaction") {
      navigate("/create-transaction");
      return;
    }

    if (page === "Create Beneficiary") {
      navigate("/create-beneficiary");
      return;
    }

    if (page === "Dashboard") {
      navigate("/dashboard");
      return;
    }

    navigate(`/dashboard?tab=${dashboardPageTabs[page]}`);
  };

  const currencies = [
    "GBP/INR",
    "GBP/USD",
    "GBP/EUR",
    "GBP/AUD",
    "GBP/CAD",
    "GBP/SGD",
  ];

  const visibleCurrencies = currencies.slice(
    currentSlide * 3,
    currentSlide * 3 + 3
  );

  const quickActions = [
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

  const days = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Year",
    "Custom Range",
  ];

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full rounded-lg px-4 py-3 text-left font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${isActive
      ? "bg-[#b589d6] text-white"
      : "bg-transparent text-slate-900 hover:bg-violet-200"
    }`;

  const submenuButtonClass = (isActive: boolean) =>
    `w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive
      ? "bg-violet-100 font-semibold text-violet-800"
      : "text-slate-600 hover:bg-violet-200 hover:text-slate-900"
    }`;

  // MAP PAGE NAMES TO THEIR COMPONENTS
  const pageComponents: Partial<Record<DashboardPage, ReactNode>> = {
    Transactions: <Transactions />,
    "Remitter Transactions": <RemitterTransactions />,
    Remitter: (
      <Remitter onAddRemitter={() => handleToggle("Create Remitter")} />
    ),
    "Create Transaction": <CreateTransactions embedded />,
    "Create Beneficiary": <CreateBeneficiary embedded />,
    "Create Remitter": (
      <CreateRemitter
        embedded
        onClose={() => handleToggle("Remitter")}
        onCreated={() => handleToggle("Remitter")}
      />
    ),
    Beneficiary: (
      <Beneficiary
        onAddBeneficiary={() => handleToggle("Create Beneficiary")}
        onScreenBeneficiary={(beneficiaryId) =>
          navigate(
            `/dashboard?tab=beneficiary-screening&beneficiaryId=${encodeURIComponent(beneficiaryId)}`
          )
        }
        onEditBeneficiary={(beneficiaryId) =>
          navigate(
            `/create-beneficiary?editBeneficiary=${encodeURIComponent(beneficiaryId)}`
          )
        }
      />
    ),
    "Beneficiary Screening": <BeneficiaryScreening />,
  };

  // SHOW THE SELECTED PAGE ON THE RIGHT
  const renderPage = () => {
    if (currentPage === "Dashboard") {
      return (
        <div className="space-y-6">
          {/* Welcome and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome to the Dashboard
            </h1>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Quick Actions */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setQuickActionsOpen((previous) => !previous)
                    }
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Quick Actions
                    <ChevronDown size={16} />
                  </button>

                  {quickActionsOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(700px,calc(100vw-2rem))] flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                      {quickActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => {
                            setQuickActionsOpen(false);

                            if (action === "Create Transactions") {
                              handleToggle("Create Transaction");
                            } else if (
                              action === "Active Remitters" ||
                              action === "Pending Remitters"
                            ) {
                              handleToggle("Remitter");
                            } else if (
                              action === "Beneficiary" || action === "Beneficiary Trsancations"
                            ) {
                              handleToggle("Beneficiary")
                            }
                            else if (
                              action === "Pending Transactions" ||
                              action === "In Progress Transactions" ||
                              action === "Unassigned Transactions"
                            ) {
                              handleToggle("Transactions");
                            } else if (action === "View Reports") {
                              handleToggle("Reports");
                            }
                          }}
                          className="shrink-0 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-violet-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={daysOpen}
                    onClick={() =>
                      setDaysOpen((previous) => !previous)
                    }
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    {selectedDay}
                    <ChevronDown size={16} />
                  </button>

                  {daysOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 flex w-36 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                      {days.map((day) => (
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
                  onClick={() => handleToggle("Reports")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              <h2 className="pb-6 text-xl font-bold text-slate-800">
                Total Transactions
              </h2>
              <p className="text-2xl font-semibold text-slate-900">0</p>
              <p className="mt-1 text-xs text-emerald-600">
                ↑ 0 delivered
              </p>
              <hr className="my-4 border-slate-200" />
              <div className="space-y-2 text-xs">
                <p className="flex justify-between">
                  Direct: <span>0</span>
                </p>
                <p className="flex justify-between">
                  White Label: <span>0</span>
                </p>
                <p className="flex justify-between">
                  Pay-in Partner: <span>0</span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              <h2 className="pb-6 text-xl font-bold text-slate-800">
                Total Volume
              </h2>
              <p className="text-2xl font-semibold text-slate-900">
                £0.00
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                ↑ £0.00 delivered
              </p>
              <hr className="my-4 border-slate-200" />
              <div className="space-y-2 text-xs">
                <p className="flex justify-between">
                  Direct: <span>£0.00</span>
                </p>
                <p className="flex justify-between">
                  White Label: <span>£0.00</span>
                </p>
                <p className="flex justify-between">
                  Pay-in Partner: <span>£0.00</span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              <h2 className="pb-6 text-xl font-bold text-slate-800">
                Active Agents
              </h2>
              <p className="text-2xl font-semibold text-slate-900">0</p>
              <p className="mt-1 text-xs text-emerald-600">
                ↑ 0 enabled
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
              <h2 className="pb-6 text-xl font-bold text-slate-800">
                Compliance Checks
              </h2>
              <p className="text-2xl font-semibold text-slate-900">0</p>
              <p className="mt-1 text-xs text-emerald-600">
                ↑ 0 cleared
              </p>
            </div>
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
              <TransactionChart />
            </div>

            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
              <PieWithGradient />
            </div>
          </section>

          {/* Currency Exchange */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Currency Exchange
            </h2>

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

          {/* Live Exchange Rates */}
          <section>
            <XELiveRatesWidget />
          </section>

          {/* Quick Rate */}
          <section>
            <QuickRate />
          </section>
        </div>
      );
    }

    // Return the component belonging to the selected page
    if (pageComponents[currentPage]) {
      return pageComponents[currentPage];
    }

    // Placeholder for pages that do not have components yet
    return (
      <div className="min-h-[calc(100vh-10rem)] rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {currentPage}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The {currentPage} page is ready to be added here.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer />
      <HeaderPage />

      <main
        className="mx-auto w-full px-5 py-5 sm:px-8"
      >
        <div className="flex items-start gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="flex w-64 shrink-0 flex-col gap-2 self-start border-r border-slate-200 p-2">
            <button
              type="button"
              onClick={() => handleToggle("Dashboard")}
              aria-current={
                currentPage === "Dashboard" ? "page" : undefined
              }
              className={sidebarButtonClass(
                currentPage === "Dashboard"
              )}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => handleToggle("Transactions")}
              aria-current={
                currentPage === "Transactions" ||
                  currentPage === "Create Transaction"
                  ? "page"
                  : undefined
              }
              className={sidebarButtonClass(
                currentPage === "Transactions" ||
                currentPage === "Create Transaction"
              )}
            >
              Transactions
            </button>

            <button
              type="button"
              onClick={() => handleToggle("Remitter")}
              aria-current={currentPage === "Remitter" ? "page" : undefined}
              className={sidebarButtonClass(currentPage === "Remitter")}
            >
              Remitter
            </button>

            <button
              type="button"
              onClick={() => handleToggle("Remitter Transactions")}
              aria-current={
                currentPage === "Remitter Transactions" ? "page" : undefined
              }
              className={sidebarButtonClass(
                currentPage === "Remitter Transactions"
              )}
            >
              Remitter Transactions
            </button>

            <button
              type="button"
              onClick={() => handleToggle("Beneficiary")}
              aria-current={currentPage === "Beneficiary" ? "page" : undefined}
              className={sidebarButtonClass(currentPage === "Beneficiary")}
            >
              Beneficiary
            </button>

            {/* Direct Transfers and Fees */}
            <div>
              <button
                type="button"
                aria-expanded={openMenu === "rates"}
                onClick={() => {
                  setOpenMenu((current) =>
                    current === "rates" ? null : "rates"
                  );
                  handleToggle("Direct Transfers and Fees");
                }}
                className={sidebarButtonClass(
                  [
                    "Direct Transfers and Fees",
                    "Overview",
                    "Beneficiary Screening",
                    "System Rates",
                    "Approval Queue",
                  ].includes(currentPage)
                )}
              >
                <span className="flex items-center justify-between">
                  Direct Transfers and Fees
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${openMenu === "rates" ? "rotate-180" : ""
                      }`}
                  />
                </span>
              </button>

              {openMenu === "rates" && (
                <nav className="mt-1 space-y-1 border-l border-violet-200 pl-3">
                  {(
                    [
                      "Overview",
                      "System Rates",
                      "Approval Queue",
                    ] as const
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handleToggle(page)}
                      aria-current={
                        currentPage === page ? "page" : undefined
                      }
                      className={submenuButtonClass(
                        currentPage === page
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Compliance */}
            <div>
              <button
                type="button"
                aria-expanded={openMenu === "compliance"}
                onClick={() => {
                  setOpenMenu((current) =>
                    current === "compliance" ? null : "compliance"
                  );
                  handleToggle("Compliance");
                }}
                className={sidebarButtonClass(
                  [
                    "Compliance",
                    "EDD Cases",
                    "Training",
                    "Policies",
                  ].includes(currentPage)
                )}
              >
                <span className="flex items-center justify-between">
                  Compliance
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${openMenu === "compliance" ? "rotate-180" : ""
                      }`}
                  />
                </span>
              </button>

              {openMenu === "compliance" && (
                <nav className="mt-1 space-y-1 border-l border-violet-200 pl-3">
                  {(
                    [
                      "Overview",
                      "EDD Cases",
                      "Training",
                      "Policies",
                    ] as const
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handleToggle(page)}
                      aria-current={
                        currentPage === page ? "page" : undefined
                      }
                      className={submenuButtonClass(
                        currentPage === page
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleToggle("Configurations")}
              aria-current={
                currentPage === "Configurations" ? "page" : undefined
              }
              className={sidebarButtonClass(
                currentPage === "Configurations"
              )}
            >
              Configurations
            </button>
          </aside>

          {/* RIGHT SIDE: DISPLAY CURRENT PAGE */}
          <section className="min-w-0 flex-1">
            {renderPage()}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
