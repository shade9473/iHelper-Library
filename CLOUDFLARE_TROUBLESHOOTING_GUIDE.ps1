# CloudFlare Diagnostics Toolkit
# Version: 1.6.0
# Last Updated: 2024-12-23

# Simple diagnostic function
function Diagnose-CloudFlare {
    $logPath = "$PSScriptRoot\cloudflare_diagnostics.log"
    
    # Clear previous log
    if (Test-Path $logPath) { 
        Clear-Content $logPath 
    }
    
    # Log start of diagnostics
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logPath -Value "$timestamp [Info] Starting CloudFlare Diagnostics"
    
    # Domains to check
    $domains = @(
        'www.ihelper.tech',
        'ihelper.tech', 
        'ihelper-library.pages.dev'
    )
    
    # DNS Check
    Write-Host "Checking DNS Resolution..." -ForegroundColor Cyan
    foreach ($domain in $domains) {
        try {
            $result = Resolve-DnsName $domain -ErrorAction Stop
            Write-Host "DNS: $domain - SUCCESS" -ForegroundColor Green
            Add-Content -Path $logPath -Value "$timestamp [Info] DNS resolution successful for $domain"
        }
        catch {
            Write-Host "DNS: $domain - FAILED" -ForegroundColor Red
            Add-Content -Path $logPath -Value "$timestamp [Error] DNS resolution failed for $domain"
        }
    }
    
    # HTTPS Check
    Write-Host "`nChecking HTTPS Connectivity..." -ForegroundColor Cyan
    foreach ($domain in $domains) {
        try {
            $req = [System.Net.WebRequest]::Create("https://$domain")
            $req.Method = "HEAD"
            $req.Timeout = 10000
            $response = $req.GetResponse()
            
            Write-Host "HTTPS: $domain - SUCCESS" -ForegroundColor Green
            Add-Content -Path $logPath -Value "$timestamp [Info] HTTPS connection successful for $domain"
        }
        catch {
            Write-Host "HTTPS: $domain - FAILED" -ForegroundColor Red
            Add-Content -Path $logPath -Value "$timestamp [Error] HTTPS connection failed for $domain"
        }
    }
    
    # Final message
    Write-Host "`nDiagnostics Complete. Check cloudflare_diagnostics.log for details." -ForegroundColor Yellow
}

# Add additional diagnostic functions
function Test-CloudFlareOriginConnectivity {
    param(
        [string[]]$Domains = @('www.ihelper.tech', 'ihelper.tech', 'ihelper-library.pages.dev')
    )

    $results = @{}

    foreach ($domain in $Domains) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $connectResult = $tcpClient.ConnectAsync($domain, 443).Wait(5000)
            
            if ($connectResult) {
                $results[$domain] = @{
                    Status = 'Success'
                    Message = 'Origin server reachable'
                }
            }
            else {
                $results[$domain] = @{
                    Status = 'Failed'
                    Message = 'Unable to establish TCP connection'
                }
            }
        }
        catch {
            $results[$domain] = @{
                Status = 'Error'
                Message = $_.Exception.Message
            }
        }
    }

    return $results
}

function Diagnose-CloudFlareAdvanced {
    $originConnectivity = Test-CloudFlareOriginConnectivity
    
    Write-Host "Advanced CloudFlare Origin Connectivity Report" -ForegroundColor Cyan
    foreach ($domain in $originConnectivity.Keys) {
        $result = $originConnectivity[$domain]
        $color = switch ($result.Status) {
            'Success' { 'Green' }
            'Failed' { 'Yellow' }
            'Error' { 'Red' }
            default { 'White' }
        }
        
        Write-Host "$($domain): $($result.Status) - $($result.Message)" -ForegroundColor $color
    }
}

# Run diagnostics
Diagnose-CloudFlare
Diagnose-CloudFlareAdvanced
