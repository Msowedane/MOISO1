export type FrontendRemitter = {
    id: string;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    country: string;
    remitterType: string;
    status: string;
};

export type FrontendBeneficiary = {
    id: string;
    remitterId?: string;
    beneficiaryId: string;
    beneficiaryName: string;
    name: string;
    firstName: string;
    middleName: string;
    lastName: string;
    country: string;
    bankAccount: string;
    accountNumber: string;
    contactInfo: string;
    relationship: string;
    totalReceived: number;
    status: string;
    screening: string;
    payoutMethods: Array<{
        method: "Account Transfer" | "Cash Pickup";
        receivingCurrency: string;
        BankName: string;
        BranchName: string;
        AccountNumber: string;
        IFSC_Code: string;
        Account_Type: "savings" | "current";
    }>;
    [key: string]: unknown;
};

const REMITTERS_KEY = "moiso.frontend.remitters";
const BENEFICIARIES_KEY = "moiso.frontend.beneficiaries";

function readRecords<T>(key: string): T[] {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return [];

    let records: unknown;
    try {
        records = JSON.parse(storedValue);
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;

        localStorage.removeItem(key);
        console.warn(
            `Removed invalid saved frontend data for "${key}". Create the records again in this browser.`
        );
        return [];
    }

    if (!Array.isArray(records)) {
        throw new Error(`Saved data for "${key}" is invalid.`);
    }

    return records as T[];
}

export function getFrontendRemitters() {
    return readRecords<FrontendRemitter>(REMITTERS_KEY);
}

export function saveFrontendRemitter(remitter: FrontendRemitter) {
    const remitters = getFrontendRemitters();
    localStorage.setItem(REMITTERS_KEY, JSON.stringify([...remitters, remitter]));
}

export function getFrontendBeneficiaries() {
    return readRecords<FrontendBeneficiary>(BENEFICIARIES_KEY);
}

export function saveFrontendBeneficiary(beneficiary: FrontendBeneficiary) {
    const beneficiaries = getFrontendBeneficiaries();
    localStorage.setItem(
        BENEFICIARIES_KEY,
        JSON.stringify([...beneficiaries, beneficiary])
    );
}

export function updateFrontendBeneficiary(beneficiary: FrontendBeneficiary) {
    const beneficiaries = getFrontendBeneficiaries();
    const index = beneficiaries.findIndex(
        (record) => record.id === beneficiary.id
    );

    if (index === -1) {
        throw new Error("Beneficiary not found. It may have been deleted.");
    }

    beneficiaries[index] = beneficiary;
    localStorage.setItem(BENEFICIARIES_KEY, JSON.stringify(beneficiaries));
}

export function deleteFrontendBeneficiary(id: string) {
    const beneficiaries = getFrontendBeneficiaries();
    const remainingBeneficiaries = beneficiaries.filter(
        (beneficiary) => beneficiary.id !== id
    );

    if (remainingBeneficiaries.length === beneficiaries.length) {
        throw new Error("Beneficiary not found. It may have already been deleted.");
    }

    localStorage.setItem(
        BENEFICIARIES_KEY,
        JSON.stringify(remainingBeneficiaries)
    );
}

export function createFrontendId(prefix: string) {
    return `${prefix}-${crypto.randomUUID()}`;
}
