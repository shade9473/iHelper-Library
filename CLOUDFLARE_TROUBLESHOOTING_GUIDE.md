param(
    [switch]$Verbose = $false
)

# Color coding for better readability
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$Color = 'Green'
    )
    
    Write-Host $Message -ForegroundColor $Color
}

# Diagnostic Function
function Invoke-CloudFlareDiagnostics {
    Write-ColorOutput "🔍 CloudFlare Diagnostics Toolkit" Yellow
    Write-ColorOutput "--------------------------------" Yellow

    # DNS Resolution Check
    Write-ColorOutput "`n🌐 Checking DNS Resolution..." Cyan
    $dnsResults = @(
        'www.ihelper.tech',
        'ihelper.tech',
        'ihelper-library.pages.dev'
    ) | ForEach-Object {
        try {
            $result = Resolve-DnsName $_ -ErrorAction Stop
            [PSCustomObject]@{
                Domain = $_
                Status = 'SUCCESS'
                Addresses = $result.IPAddress -join ', '
            }
        }
        catch {
            [PSCustomObject]@{
                Domain = $_
                Status = 'FAILED'
                Error = $_.Exception.Message
            }
        }
    }

    $dnsResults | Format-Table -AutoSize

    # SSL/TLS Connection Check
    Write-ColorOutput "`n🔒 Checking HTTPS Connectivity..." Cyan
    $tlsResults = @(
        'www.ihelper.tech',
        'ihelper.tech',
        'ihelper-library.pages.dev'
    ) | ForEach-Object {
        try {
            $req = [System.Net.WebRequest]::Create("https://$_")
            $req.Method = "HEAD"
            $req.Timeout = 10000  # 10 seconds
            $response = $req.GetResponse()
            
            [PSCustomObject]@{
                Domain = $_
                Status = 'SUCCESS'
                StatusCode = $response.StatusCode
                Server = $response.Server
            }
        }
        catch {
            [PSCustomObject]@{
                Domain = $_
                Status = 'FAILED'
                Error = $_.Exception.Message
            }
        }
    }

    $tlsResults | Format-Table -AutoSize

    # GitHub Secrets Validation Placeholder
    Write-ColorOutput "`n🔑 GitHub Secrets Validation" Cyan
    Write-Host "Manual Check Required:" -ForegroundColor Yellow
    Write-Host "1. Verify CLOUDFLARE_API_TOKEN exists" -ForegroundColor White
    Write-Host "2. Verify CLOUDFLARE_ZONE_ID exists" -ForegroundColor White
    Write-Host "3. Verify CLOUDFLARE_ACCOUNT_ID exists" -ForegroundColor White

    # Recommendations
    Write-ColorOutput "`n🚧 Potential Next Steps:" Yellow
    if ($dnsResults.Status -contains 'FAILED') {
        Write-Host "- Resolve DNS configuration issues" -ForegroundColor Red
    }
    if ($tlsResults.Status -contains 'FAILED') {
        Write-Host "- Check SSL/TLS and origin server connectivity" -ForegroundColor Red
    }
    Write-Host "- Verify CloudFlare Pages deployment" -ForegroundColor White
    Write-Host "- Check GitHub repository secrets" -ForegroundColor White
}

# Run Diagnostics
Invoke-CloudFlareDiagnostics
