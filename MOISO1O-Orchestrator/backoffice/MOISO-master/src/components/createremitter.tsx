import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { createFrontendId, saveFrontendRemitter } from "../lib/frontendStore";
type CreateRemitterProps = {
    onClose: () => void;
    onCreated: () => void;
    embedded?: boolean;
};

type RemitterFormData = {
    accountType: string;
    accountCountry: string;
    sendVerificationEmail: boolean;
    remitterType: string;
    email: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    occupation: string;
    placeOfBirth: string;
    favoriteDestinationCountry: string;
    idType: string;
    idNumber: string;
    idExpiry: string;
    sourceOfFunds: string;
    sourceOfFundsOther: string;
    sourceOfIncome: string;
    phoneCountryCode: string;
    phone: string;
    postcodeLookup: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateCounty: string;
    addressCountry: string;
    postalCode: string;
    test12: string;
    test11: string;
    referralSource: string;
};

const countries = [
    "United Kingdom",
    "United States",
    "India",
    "Pakistan",
    "Ghana",
    "Morocco",
    "Nepal",
    "Turkey",
    "United Arab Emirates",
    "Germany",
];

const phoneCountryCodes = [
    ["United Arab Emirates", "+971", "🇦🇪"],
    ["Australia", "+61", "🇦🇺"],
    ["Bangladesh", "+880", "🇧🇩"],
    ["Canada", "+1", "🇨🇦"],
    ["Germany", "+49", "🇩🇪"],
    ["France", "+33", "🇫🇷"],
    ["United Kingdom", "+44", "🇬🇧"],
    ["Ghana", "+233", "🇬🇭"],
    ["Ireland", "+353", "🇮🇪"],
    ["India", "+91", "IND"],
    ["Kenya", "+254", "🇰🇪"],
    ["Morocco", "+212", "🇲🇦"],
    ["Nigeria", "+234", "🇳🇬"],
    ["Nepal", "+977", "🇳🇵"],
    ["Philippines", "+63", "🇵🇭"],
    ["Pakistan", "+92", "🇵🇰"],
    ["Saudi Arabia", "+966", "🇸🇦"],
    ["Turkey", "+90", "🇹🇷"],
    ["Uganda", "+256", "🇺🇬"],
    ["United States", "+1", "🇺🇸"],
    ["South Africa", "+27", "🇿🇦"],
];

const sectionClass = "space-y-5";
const sectionHeadingClass =
    "border-b border-slate-100 pb-3 text-base font-semibold text-slate-900";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";


function CreateRemitter({
    onClose,
    onCreated,
    embedded = false,
}: CreateRemitterProps) {
    const [formData, setFormData] = useState<RemitterFormData>({
        accountType: "Consumer",
        accountCountry: "United Kingdom",
        sendVerificationEmail: true,
        remitterType: "Direct",
        email: "",
        title: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        nationality: "",
        occupation: "",
        placeOfBirth: "",
        favoriteDestinationCountry: "",
        idType: "",
        idNumber: "",
        idExpiry: "",
        sourceOfFunds: "",
        sourceOfFundsOther: "",
        sourceOfIncome: "",
        phoneCountryCode: "+91",
        phone: "",
        postcodeLookup: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        stateCounty: "",
        addressCountry: "United Kingdom",
        postalCode: "",
        test12: "",
        test11: "",
        referralSource: "",
    });

    const today = new Date();
    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const adultBirthDate = `${today.getFullYear() - 18}-${todayDate.slice(5)}`;
    const idDetailsStarted = Boolean(
        formData.idType || formData.idNumber || formData.idExpiry
    );

    const updateField = <K extends keyof RemitterFormData>(
        field: K,
        value: RemitterFormData[K]
    ) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            saveFrontendRemitter({
                id: createFrontendId("REM"),
                customerId: createFrontendId("CUS"),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                mobileNumber: `${formData.phoneCountryCode}${formData.phone}`.trim(),
                country: formData.accountCountry,
                remitterType: formData.accountType,
                status: "ACTIVE",
            });
        } catch (saveError) {
            toast.error(
                saveError instanceof Error
                    ? saveError.message
                    : "Unable to save the remitter in this browser."
            );
            return;
        }

        onCreated();
        toast.success("Remitter Added Successfully", {
            position: "bottom-right",
            autoClose: 1000,
            toastId: "Remitter is created",
        });
    };

    const handleClear = () => {
        setFormData({
            accountType: "Consumer",
            accountCountry: "United Kingdom",
            sendVerificationEmail: true,
            remitterType: "Direct",
            email: "",
            title: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "",
            nationality: "",
            occupation: "",
            placeOfBirth: "",
            favoriteDestinationCountry: "",
            idType: "",
            idNumber: "",
            idExpiry: "",
            sourceOfFunds: "",
            sourceOfFundsOther: "",
            sourceOfIncome: "",
            phoneCountryCode: "+44",
            phone: "",
            postcodeLookup: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            stateCounty: "",
            addressCountry: "United Kingdom",
            postalCode: "",
            test12: "",
            test11: "",
            referralSource: "",
        });
    };

    return (
        <div
            className={
                embedded
                    ? "w-full overflow-y-auto bg-white"
                    : "fixed inset-0 z-[9999] h-screen w-screen overflow-y-auto bg-slate-50"
            }
        >
            <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Back to Create Transaction"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Create Remitter
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        The new remitter will be selected for this transaction automatically.
                    </p>
                </div>
            </header>

            <main className="w-full px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
                >
                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Account Information</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Basic account details for the remitter.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="accountType" className={labelClass}>Remitter Type *</label>
                                <select id="accountType" className={inputClass} value={formData.accountType} onChange={(event) => updateField("accountType", event.target.value)}>
                                    <option>Consumer</option>
                                    <option>Business</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="accountCountry" className={labelClass}>Country</label>
                                <select id="accountCountry" className={inputClass} value={formData.accountCountry} onChange={(event) => updateField("accountCountry", event.target.value)}>
                                    {countries.map((country) => <option key={country}>{country}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Remitter Type</h3>
                            <p className="mt-2 text-sm text-slate-500">Choose whether this is a direct remitter or an agent&apos;s remitter.</p>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Personal Information</h3>
                            <p className="mt-2 text-sm text-slate-500">Remitter&apos;s personal details.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label htmlFor="title" className={labelClass}>Title</label>
                                <select id="title" className={inputClass} value={formData.title} onChange={(event) => updateField("title", event.target.value)} required>
                                    <option value="">Select title</option>
                                    {["Mr.", "Ms.", "Mrs.", "Miss."].map((title) => <option key={title}>{title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="firstName" className={labelClass}>First Name</label>
                                <input id="firstName" autoComplete="given-name" className={inputClass} value={formData.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="middleName" className={labelClass}>Middle Name <span className="font-normal text-slate-500">(Optional)</span></label>
                                <input id="middleName" autoComplete="additional-name" className={inputClass} value={formData.middleName} onChange={(event) => updateField("middleName", event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="lastName" className={labelClass}>Last Name</label>
                                <input id="lastName" autoComplete="family-name" className={inputClass} value={formData.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
                            </div>
                            <div className="lg:col-span-2">
                                <label htmlFor="gender" className={labelClass}>Gender</label>
                                <select id="gender" className={inputClass} value={formData.gender} onChange={(event) => updateField("gender", event.target.value)} required>
                                    <option value="">Select gender</option>
                                    {["Male", "Female", "Unspecified", "Other"].map((gender) => <option key={gender}>{gender}</option>)}
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
                                <input id="dateOfBirth" type="date" max={adultBirthDate} autoComplete="bday" className={inputClass} value={formData.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} required />
                                <p className="mt-1 text-xs text-slate-500">Remitter must be at least 18 years old.</p>
                            </div>
                            <div className="lg:col-span-2">
                                <label htmlFor="nationality" className={labelClass}>Nationality</label>
                                <select id="nationality" className={inputClass} value={formData.nationality} onChange={(event) => updateField("nationality", event.target.value)} required>
                                    <option value="">Select nationality</option>
                                    {countries.map((country) => <option key={country}>{country}</option>)}
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label htmlFor="occupation" className={labelClass}>Occupation *</label>
                                <input id="occupation" className={inputClass} placeholder="e.g. Software Engineer" value={formData.occupation} onChange={(event) => updateField("occupation", event.target.value)} required />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <label htmlFor="placeOfBirth" className={labelClass}>Place of Birth <span className="font-normal text-slate-500">(Optional)</span></label>
                                <input id="placeOfBirth" className={inputClass} value={formData.placeOfBirth} onChange={(event) => updateField("placeOfBirth", event.target.value)} />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <label htmlFor="favoriteDestinationCountry" className={labelClass}>Favorite Destination Country <span className="font-normal text-slate-500">(Optional)</span></label>
                                <select id="favoriteDestinationCountry" className={inputClass} value={formData.favoriteDestinationCountry} onChange={(event) => updateField("favoriteDestinationCountry", event.target.value)}>
                                    <option value="">None</option>
                                    {countries.map((country) => <option key={country}>{country}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>ID Details</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Identification document details are optional. If you fill in any ID field, complete all of them.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label htmlFor="idType" className={labelClass}>ID Type</label>
                                <select id="idType" className={inputClass} value={formData.idType} onChange={(event) => updateField("idType", event.target.value)}>
                                    <option value="">None</option>
                                    {["Passport", "Driving License", "National ID", "Residence Permit"].map((idType) => <option key={idType}>{idType}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="idNumber" className={labelClass}>ID Number</label>
                                <input id="idNumber" className={inputClass} value={formData.idNumber} onChange={(event) => updateField("idNumber", event.target.value)} required={idDetailsStarted} />
                            </div>
                            <div>
                                <label htmlFor="idExpiry" className={labelClass}>ID Expiry Date</label>
                                <input id="idExpiry" type="date" min={todayDate} className={inputClass} value={formData.idExpiry} onChange={(event) => updateField("idExpiry", event.target.value)} required={idDetailsStarted} />
                                <p className="mt-1 text-xs text-slate-500">Document must not be expired.</p>
                            </div>
                            <div>
                                <label htmlFor="sourceOfFunds" className={labelClass}>Source of Funds <span className="font-normal text-slate-500">(Optional)</span></label>
                                <select id="sourceOfFunds" className={inputClass} value={formData.sourceOfFunds} onChange={(event) => updateField("sourceOfFunds", event.target.value)}>
                                    <option value="">None</option>
                                    {["Salary / Wages", "Business Income", "Investment Income", "Inheritance", "Savings", "Other"].map((source) => <option key={source}>{source}</option>)}
                                </select>
                            </div>
                            {formData.sourceOfFunds === "Other" && (
                                <div>
                                    <label htmlFor="sourceOfFundsOther" className={labelClass}>Please specify</label>
                                    <input id="sourceOfFundsOther" className={inputClass} value={formData.sourceOfFundsOther} onChange={(event) => updateField("sourceOfFundsOther", event.target.value)} required />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Contact Information</h3>
                            <p className="mt-2 text-sm text-slate-500">Email and mobile number for the remitter.</p>
                        </div>
                        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={formData.sendVerificationEmail}
                                onChange={(event) => updateField("sendVerificationEmail", event.target.checked)}
                                className="mt-1 h-4 w-4 accent-violet-600"
                            />
                            <span>
                                Send verification emails
                                <span className="mt-1 block text-slate-500">
                                    Sends the identity (IND) and email-verification links. Login credentials are emailed automatically once email, KYC, identity, and address are all verified. Leave unchecked to create the remitter without sending any email.
                                </span>
                            </span>
                        </label>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="email" className={labelClass}>Email Address *</label>
                                <input id="email" type="email" autoComplete="email" placeholder="remitter@example.com" className={inputClass} value={formData.email} onChange={(event) => updateField("email", event.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="phone" className={labelClass}>Mobile Number</label>
                                <div className="flex gap-2">
                                    <select aria-label="Phone country code" className="w-44 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" value={formData.phoneCountryCode} onChange={(event) => updateField("phoneCountryCode", event.target.value)}>
                                        {phoneCountryCodes.map(([country, code, flag], index) => <option key={`${country}-${index}`} value={code}>{flag} {code}</option>)}
                                    </select>
                                    <input id="phone" type="tel" autoComplete="tel-national" className={inputClass} value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} required />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Address Information</h3>
                            <p className="mt-2 text-sm text-slate-500">Remitter&apos;s residential address.</p>
                        </div>
                        <div>
                            <label htmlFor="postcodeLookup" className={labelClass}>Postcode Lookup</label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input id="postcodeLookup" type="search" className={inputClass} placeholder="Enter postcode" value={formData.postcodeLookup} onChange={(event) => updateField("postcodeLookup", event.target.value)} />
                                <button type="button" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Search</button>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Or enter your address manually below.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="addressLine1" className={labelClass}>Address Line 1 *</label>
                                <input id="addressLine1" autoComplete="address-line1" className={inputClass} value={formData.addressLine1} onChange={(event) => updateField("addressLine1", event.target.value)} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="addressLine2" className={labelClass}>Address Line 2 <span className="font-normal text-slate-500">(Optional)</span></label>
                                <input id="addressLine2" autoComplete="address-line2" placeholder="Apartment, suite, etc. (optional)" className={inputClass} value={formData.addressLine2} onChange={(event) => updateField("addressLine2", event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="city" className={labelClass}>City</label>
                                <input id="city" autoComplete="address-level2" className={inputClass} value={formData.city} onChange={(event) => updateField("city", event.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="stateCounty" className={labelClass}>State/County</label>
                                <input id="stateCounty" autoComplete="address-level1" className={inputClass} value={formData.stateCounty} onChange={(event) => updateField("stateCounty", event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="postalCode" className={labelClass}>Postal Code</label>
                                <input id="postalCode" autoComplete="postal-code" className={inputClass} value={formData.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="addressCountry" className={labelClass}>Country</label>
                                <select id="addressCountry" autoComplete="country-name" className={inputClass} value={formData.addressCountry} onChange={(event) => updateField("addressCountry", event.target.value)} required>
                                    {countries.map((country) => <option key={country}>{country}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div>
                            <h3 className={sectionHeadingClass}>Additional Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="test12" className={labelClass}>Test 12</label>
                                <input id="test12" className={inputClass} value={formData.test12} onChange={(event) => updateField("test12", event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="sourceOfIncome" className={labelClass}>Source of Income</label>
                                <select id="sourceOfIncome" className={inputClass} value={formData.sourceOfIncome} onChange={(event) => updateField("sourceOfIncome", event.target.value)}>
                                    <option value="">None</option>
                                    <option>Salary</option>
                                    <option>Savings</option>
                                    <option>Test 8</option>
                                    <option>Whatever</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="test11" className={labelClass}>Test 11</label>
                                <input id="test11" className={inputClass} value={formData.test11} onChange={(event) => updateField("test11", event.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="referralSource" className={labelClass}>How Did You Hear About Us?</label>
                                <select id="referralSource" className={inputClass} value={formData.referralSource} onChange={(event) => updateField("referralSource", event.target.value)}>
                                    <option value="">None</option>
                                    <option>LinkedIn</option>
                                    <option>Social Media</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-violet-100 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
                        >
                            Create Remitter
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default CreateRemitter;
