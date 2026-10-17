
# Load environment variables from the local .env file
$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    throw ".env file not found: $envFile"
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
        $name = $Matches[1]
        $value = $Matches[2].Trim()

        # Remove optional surrounding quotes
        if ($value.Length -ge 2) {
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
        }

        Set-Item -Path "Env:$name" -Value $value
    }
}

# Start Spring Boot from the backend directory
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
