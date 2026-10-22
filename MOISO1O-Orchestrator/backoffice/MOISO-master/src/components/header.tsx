import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HeaderPage() {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <header className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-base font-bold tracking-wide text-slate-900">
                    MOISO <span>PAY</span>
                </span>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
                >
                    Admin
                </button>

                {profileMenuOpen && (
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-40 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-lg">
                        <p className="mb-3 text-sm font-medium text-slate-600">
                            Profile settings
                        </p>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-lg px-3 py-1 text-sm font-semibold text-white transition"
                        >
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default HeaderPage;