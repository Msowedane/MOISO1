$backendRoot = Split-Path -Parent $PSScriptRoot
$securePasscode = Read-Host 'Enter the new admin IP bypass passcode (minimum 8 characters)' -AsSecureString
$passcodePointer = [IntPtr]::Zero

try {
    $passcodePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePasscode)
    $plainPasscode = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passcodePointer)

    if ($plainPasscode.Length -lt 8) {
        throw 'The bypass passcode must be at least 8 characters long.'
    }

    Push-Location $backendRoot
    try {
        $env:ADMIN_IP_BYPASS_PASSCODE = $plainPasscode
        $nodeScript = @'
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

(async () => {
  const passcode = process.env.ADMIN_IP_BYPASS_PASSCODE;
  if (!passcode) {
    throw new Error("The bypass passcode was not provided.");
  }

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Backend .env file was not found.");
  }

  const passcodeHash = await bcrypt.hash(passcode, 12);
  const existing = fs.readFileSync(envPath, "utf8");
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const setting = `IP_BYPASS_PASSCODE_HASH=${passcodeHash}`;
  const settingPattern = /^IP_BYPASS_PASSCODE_HASH\s*=.*$/m;
  const updated = settingPattern.test(existing)
    ? existing.replace(settingPattern, setting)
    : `${existing}${existing.endsWith("\n") || existing.length === 0 ? "" : newline}${setting}${newline}`;

  fs.writeFileSync(envPath, updated, { mode: 0o600 });
  console.log("IP_BYPASS_PASSCODE_HASH was written to the backend .env file.");
})().catch((error) => {
  console.error("Could not write the bypass passcode hash:", error.message);
  process.exitCode = 1;
});
'@

        $nodeScript | node -
        if ($LASTEXITCODE -ne 0) {
            throw 'Failed to write the bypass passcode hash to .env.'
        }
    }
    finally {
        Remove-Item Env:ADMIN_IP_BYPASS_PASSCODE -ErrorAction SilentlyContinue
        Pop-Location
    }
}
finally {
    $plainPasscode = $null
    if ($passcodePointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passcodePointer)
    }
    $securePasscode.Dispose()
}
