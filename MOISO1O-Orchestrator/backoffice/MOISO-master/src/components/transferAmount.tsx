import { useState } from "react";

type Country = {
    name: string;
    code: string;
    currency: string;
};

const countries: Country[] = [
    { name: "India", code: "IN", currency: "INR" },
    { name: "United States", code: "US", currency: "USD" },
    { name: "United Kingdom", code: "GB", currency: "GBP" },
    { name: "United Arab Emirates", code: "AE", currency: "AED" },
    { name: "Oman", code: "OM", currency: "OMR" },
    { name: "Saudi Arabia", code: "SA", currency: "SAR" },
    { name: "Bangladesh", code: "BD", currency: "BDT" },
    { name: "Pakistan", code: "PK", currency: "PKR" },
    { name: "Sri Lanka", code: "LK", currency: "LKR" },
    { name: "Nepal", code: "NP", currency: "NPR" },
    { name: "Philippines", code: "PH", currency: "PHP" },
    { name: "Indonesia", code: "ID", currency: "IDR" },
    { name: "Malaysia", code: "MY", currency: "MYR" },
    { name: "Singapore", code: "SG", currency: "SGD" },
    { name: "Thailand", code: "TH", currency: "THB" },
    { name: "China", code: "CN", currency: "CNY" },
    { name: "Japan", code: "JP", currency: "JPY" },
    { name: "South Korea", code: "KR", currency: "KRW" },
    { name: "Australia", code: "AU", currency: "AUD" },
    { name: "New Zealand", code: "NZ", currency: "NZD" },
    { name: "Canada", code: "CA", currency: "CAD" },
    { name: "Germany", code: "DE", currency: "EUR" },
    { name: "France", code: "FR", currency: "EUR" },
    { name: "Italy", code: "IT", currency: "EUR" },
    { name: "Spain", code: "ES", currency: "EUR" },
    { name: "Switzerland", code: "CH", currency: "CHF" },
    { name: "South Africa", code: "ZA", currency: "ZAR" },
    { name: "Nigeria", code: "NG", currency: "NGN" },
    { name: "Kenya", code: "KE", currency: "KES" },
    { name: "Egypt", code: "EG", currency: "EGP" },
    { name: "Turkey", code: "TR", currency: "TRY" },
    { name: "Brazil", code: "BR", currency: "BRL" },
    { name: "Mexico", code: "MX", currency: "MXN" },
    { name: "Argentina", code: "AR", currency: "ARS" },
    { name: "Russia", code: "RU", currency: "RUB" },
];

function TransferAmount() {
    const [amount, setAmount] = useState<number>(0);
    const [selectedCountry, setSelectedCountry] = useState<string>("IN");

    const country = countries.find(
        (item) => item.code === selectedCountry
    );

    return (
        <div className="max-w-md space-y-4 rounded-lg border p-5">
            <h2 className="text-xl font-semibold">Transfer Amount</h2>

            <label className="block text-sm font-medium">
                Select Country
            </label>

            <select
                className="w-full rounded-md border p-2"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
            >
                {countries.map((item) => (
                    <option key={item.code} value={item.code}>
                        {item.name} ({item.currency})
                    </option>
                ))}
            </select>

            <label className="block text-sm font-medium">
                Enter Amount ({country?.currency})
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border p-2"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter transfer amount"
            />

            <p className="text-sm text-gray-600">
                Country: {country?.name}
            </p>

            <p className="text-sm text-gray-600">
                Amount: {country?.currency} {amount.toFixed(2)}
            </p>
        </div>
    );
}

export default TransferAmount;