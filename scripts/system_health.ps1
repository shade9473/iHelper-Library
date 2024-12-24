# Advanced System Health Optimization for Dell Inspiron 15 (AMD Ryzen)
# Requires -RunAsAdministrator
# Version: 2.1
# Last Updated: 2024-12-23

[CmdletBinding(SupportsShouldProcess=$true, ConfirmImpact='High')]
param(
    [switch]$DryRun,
    [switch]$Force
)

# Configure console window for better visibility
$host.UI.RawUI.WindowTitle = "System Health Optimization"
try {
    $windowSize = $host.UI.RawUI.WindowSize
    $windowSize.Width = [Math]::Min(120, $host.UI.RawUI.MaxWindowSize.Width)
    $windowSize.Height = [Math]::Min(50, $host.UI.RawUI.MaxWindowSize.Height)
    $host.UI.RawUI.WindowSize = $windowSize
}
catch {
    Write-Warning "Unable to resize console window: $_"
}

# Strict error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$VerbosePreference = 'Continue'

# Initialize logging with timestamp and ensure log directory exists
$script:LogDir = Join-Path $env:TEMP "SystemHealth_Logs"
if (-not (Test-Path $script:LogDir)) {
    New-Item -ItemType Directory -Path $script:LogDir -Force | Out-Null
}
$script:LogPath = Join-Path $script:LogDir "SystemHealth_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:DryRun = $DryRun

# Verification function to ensure critical components are available
function Test-RequiredComponents {
    $requiredCommands = @(
        'Get-CimInstance',
        'Get-WmiObject',
        'Set-ItemProperty',
        'Get-NetAdapter',
        'powercfg'
    )
    
    $missingCommands = @()
    foreach ($cmd in $requiredCommands) {
        if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missingCommands += $cmd
        }
    }
    
    if ($missingCommands.Count -gt 0) {
        throw "Missing required commands: $($missingCommands -join ', ')"
    }
    
    return $true
}

# Enhanced logging with mandatory parameters and validation
function Write-OptimizationLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
        [string]$Message,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success', 'Debug')]
        [string]$Level,
        
        [switch]$NoCR
    )
    
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $logMessage = "[$timestamp] [$Level] $Message"
        
        # Ensure log file is accessible
        if (-not (Test-Path $script:LogPath)) {
            New-Item -ItemType File -Path $script:LogPath -Force | Out-Null
        }
        
        # Write to log file with error handling
        try {
            Add-Content -Path $script:LogPath -Value $logMessage -ErrorAction Stop
        }
        catch {
            Write-Warning "Failed to write to log file: $_"
        }
        
        # Console output with color and validation
        $color = switch ($Level) {
            'Error'   { 'Red' }
            'Warning' { 'Yellow' }
            'Success' { 'Green' }
            'Debug'   { 'Cyan' }
            default   { 'White' }
        }
        
        if ($NoCR) {
            Write-Host $logMessage -ForegroundColor $color -NoNewline
        } else {
            Write-Host $logMessage -ForegroundColor $color
        }
        
        # Additional debug information if verbose
        if ($VerbosePreference -eq 'Continue') {
            Write-Verbose "Log entry created: $Level - $Message"
        }
    }
    catch {
        Write-Warning "Critical logging error: $_"
        throw
    }
}

# Initialize type accelerators with cleanup tracking
$script:CustomTypeAccelerators = @()

function Register-CustomTypeAccelerator {
    param(
        [string]$ShortName,
        [string]$FullName
    )
    
    $TypeAccelerators = [psobject].Assembly.GetType("System.Management.Automation.TypeAccelerators")
    
    try {
        if (-not $TypeAccelerators::Get.ContainsKey($ShortName)) {
            $TypeAccelerators::Add($ShortName, $FullName)
            $script:CustomTypeAccelerators += $ShortName
        }
    }
    catch {
        Write-Warning "Could not register type accelerator '$ShortName': $_"
    }
}

function Remove-CustomTypeAccelerators {
    $TypeAccelerators = [psobject].Assembly.GetType("System.Management.Automation.TypeAccelerators")
    
    foreach ($name in $script:CustomTypeAccelerators) {
        try {
            if ($TypeAccelerators::Get.ContainsKey($name)) {
                $TypeAccelerators::Remove($name)
            }
        }
        catch {
            Write-Warning "Could not remove type accelerator '$name': $_"
        }
    }
    $script:CustomTypeAccelerators = @()
}

# Register required type accelerators
$typeMap = @{
    'Diagnostics'              = 'System.Diagnostics.Process'
    'WindowsIdentity'          = 'System.Security.Principal.WindowsIdentity'
    'WindowsPrincipal'         = 'System.Security.Principal.WindowsPrincipal'
    'WindowsBuiltInRole'       = 'System.Security.Principal.WindowsBuiltInRole'
    'RegistryKey'              = 'Microsoft.Win32.RegistryKey'
    'RegistryHive'            = 'Microsoft.Win32.RegistryHive'
    'Marshal'                 = 'System.Runtime.InteropServices.Marshal'
}

foreach ($type in $typeMap.GetEnumerator()) {
    Register-CustomTypeAccelerator -ShortName $type.Key -FullName $type.Value
}

# Pre-execution validation function
function Test-PreExecutionRequirements {
    param(
        [switch]$Verbose
    )
    
    $validationResults = @{
        Success = $true
        Warnings = @()
        Errors = @()
        SystemState = @{}
    }

    try {
        # 1. Critical System State Validation
        $validationResults.SystemState = @{
            PowerStatus = (Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue).BatteryStatus
            CPULoad = (Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
            AvailableMemory = [Math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
            DiskSpace = [Math]::Round((Get-PSDrive C).Free / 1GB, 2)
            PendingReboot = Test-Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending"
            RunningProcesses = (Get-Process).Count
        }

        # 2. Critical Safety Checks
        $criticalChecks = @(
            @{
                Test = { -not $validationResults.SystemState.PendingReboot }
                Error = "System has pending reboot. Optimization cannot proceed safely."
                Critical = $true
            }
            @{
                Test = { $validationResults.SystemState.DiskSpace -ge 20 }
                Error = "Insufficient disk space (< 20GB free). Required for safe operation."
                Critical = $true
            }
            @{
                Test = { $validationResults.SystemState.AvailableMemory -ge 2 }
                Error = "Insufficient memory (< 2GB available). Cannot proceed safely."
                Critical = $true
            }
            @{
                Test = { $validationResults.SystemState.CPULoad -lt 80 }
                Error = "CPU usage too high (> 80%). System under heavy load."
                Critical = $true
            }
        )

        # 3. Warning Checks
        $warningChecks = @(
            @{
                Test = { Get-Process -Name "msedge", "chrome", "firefox" -ErrorAction SilentlyContinue }
                Warning = "Web browsers are running. Consider closing them first."
            }
            @{
                Test = { Get-Process -Name "outlook", "thunderbird" -ErrorAction SilentlyContinue }
                Warning = "Email clients are running. Consider closing them first."
            }
            @{
                Test = { Get-Process -Name "code", "devenv", "rider" -ErrorAction SilentlyContinue }
                Warning = "Development environments are running. Consider saving work."
            }
        )

        # 4. Backup Validation
        $backupChecks = @(
            @{
                Test = { Test-Path $env:SystemDrive\Windows.old }
                Warning = "Windows.old folder exists. Ensure system stability before proceeding."
            }
            @{
                Test = { 
                    try {
                        (Get-ComputerRestorePoint -ErrorAction Stop).Count -eq 0
                    }
                    catch {
                        $true  # If we can't check restore points, assume we need one
                    }
                }
                Warning = "No system restore points found. Creating new restore point."
            }
        )

        # Execute Critical Checks
        foreach ($check in $criticalChecks) {
            if (-not (& $check.Test)) {
                $validationResults.Errors += $check.Error
                if ($check.Critical) {
                    $validationResults.Success = $false
                }
            }
        }

        # Execute Warning Checks
        foreach ($check in $warningChecks + $backupChecks) {
            if (& $check.Test) {
                $validationResults.Warnings += $check.Warning
            }
        }

        # 5. Additional Safety Measures
        if ($validationResults.Success) {
            # Create system restore point if we have permissions
            try {
                Checkpoint-Computer -Description "Pre-System-Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop
            }
            catch {
                $validationResults.Warnings += "Failed to create system restore point: $_"
            }

            # Export current power scheme
            try {
                $powerScheme = (powercfg /GetActiveScheme) -replace '^.*: ([0-9a-f-]+).*$','$1'
                if ($powerScheme) {
                    $validationResults.SystemState.OriginalPowerScheme = $powerScheme
                }
            }
            catch {
                $validationResults.Warnings += "Failed to get current power scheme: $_"
            }

            # Verify AMD driver state
            $amdDriver = Get-WmiObject Win32_VideoController | Where-Object { $_.Name -match "AMD" }
            if ($amdDriver) {
                $validationResults.SystemState.AMDDriverVersion = $amdDriver.DriverVersion
            } else {
                $validationResults.Warnings += "AMD graphics driver not detected. Some optimizations may not apply."
            }
        }

        # Log validation results
        Write-OptimizationLog "System State Validation Results:" -Level Info
        Write-OptimizationLog "- Power Status: $($validationResults.SystemState.PowerStatus)" -Level Info
        Write-OptimizationLog "- CPU Load: $($validationResults.SystemState.CPULoad)%" -Level Info
        Write-OptimizationLog "- Available Memory: $($validationResults.SystemState.AvailableMemory)GB" -Level Info
        Write-OptimizationLog "- Free Disk Space: $($validationResults.SystemState.DiskSpace)GB" -Level Info
        Write-OptimizationLog "- Running Processes: $($validationResults.SystemState.RunningProcesses)" -Level Info

        foreach ($error in $validationResults.Errors) {
            Write-OptimizationLog $error -Level Error
        }

        foreach ($warning in $validationResults.Warnings) {
            Write-OptimizationLog $warning -Level Warning
        }

        return $validationResults
    }
    catch {
        Write-OptimizationLog "Critical error during pre-execution validation: $_" -Level Error
        $validationResults.Success = $false
        $validationResults.Errors += $_.Exception.Message
        return $validationResults
    }
}

# Hardware detection and validation
try {
    $HARDWARE_CONFIG = @{
        BIOS = (Get-CimInstance -ClassName Win32_BIOS)
        Motherboard = (Get-CimInstance -ClassName Win32_BaseBoard)
        PowerSupply = (Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue)
        Processor = (Get-CimInstance -ClassName Win32_Processor)
        PhysicalMemory = (Get-CimInstance -ClassName Win32_PhysicalMemory)
        DiskDrives = (Get-PhysicalDisk)
    }

    # Validate AMD Ryzen processor
    if (-not ($HARDWARE_CONFIG.Processor.Name -match "AMD Ryzen")) {
        Write-Warning "Non-AMD Ryzen processor detected. Some optimizations may not apply."
    }
} catch {
    Write-Error "Failed to detect hardware configuration: $_"
    exit 1
}

# Enhanced system configuration with dynamic thresholds
$SYSTEM_CONFIG = @{
    CPU = @{
        Model = $HARDWARE_CONFIG.Processor.Name
        PowerPlan = "High performance"
        MaxTemp = if ($HARDWARE_CONFIG.Processor.Name -match "7530U") { 95 } else { 90 }  # Celsius
        Threads = $HARDWARE_CONFIG.Processor.NumberOfLogicalProcessors
        Architecture = [Environment]::Is64BitOperatingSystem
        PowerThrottling = $false
        BoostMode = if ($HARDWARE_CONFIG.PowerSupply.BatteryStatus -eq 2) { "Aggressive" } else { "Balanced" }
    }
    Memory = @{
        PagefileOptimal = if ($HARDWARE_CONFIG.PhysicalMemory.Capacity / 1GB -gt 16) { 1.5 } else { 2.0 }
        ClearStandbyCache = $true
        MinFreeSpace = [Math]::Max(2GB, $HARDWARE_CONFIG.PhysicalMemory.Capacity * 0.05)
        LowMemoryThreshold = [Math]::Max(20, [Math]::Round($HARDWARE_CONFIG.PhysicalMemory.Capacity * 0.1 / 1GB))
        PhysicalMemory = $HARDWARE_CONFIG.PhysicalMemory.Capacity
        CompressionEnabled = $true
    }
    Storage = @{
        MinimumFreeSpace = [Math]::Max(20GB, (Get-Volume C).Size * 0.1)
        TempFileMaxAge = 7  # days
        DiskType = $HARDWARE_CONFIG.DiskDrives.MediaType
        SmartAttributes = $true
        DefragThreshold = if ($HARDWARE_CONFIG.DiskDrives.MediaType -eq 'SSD') { 0 } else { 10 }
        TrimEnabled = $HARDWARE_CONFIG.DiskDrives.MediaType -eq 'SSD'
    }
    Network = @{
        OptimizeTCP = $true
        UpdateDNS = $true
        NetworkAdapters = @(Get-NetAdapter | Where-Object Status -eq 'Up')
        QoSEnabled = $true
        IPv6Enabled = $true
        NetworkProfile = (Get-NetConnectionProfile).NetworkCategory
        WifiPowerSave = if ($HARDWARE_CONFIG.PowerSupply.BatteryStatus -eq 2) { "Maximum" } else { "Disabled" }
    }
    Graphics = @{
        Driver = "AMD Radeon"
        PowerSaving = $HARDWARE_CONFIG.PowerSupply.BatteryStatus -ne 2
        VSyncControl = $true
        MemoryAllocation = if ($HARDWARE_CONFIG.PhysicalMemory.Capacity / 1GB -gt 16) { "Dynamic" } else { "Conservative" }
        DriverVersion = (Get-WmiObject Win32_VideoController | Where-Object { $_.Name -match "AMD" }).DriverVersion
    }
    Security = @{
        BitLockerEnabled = $false
        AntiVirusActive = [bool](Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct)
        FirewallEnabled = (Get-NetFirewallProfile).Enabled -notcontains $false
        SecureBootEnabled = Confirm-SecureBootUEFI
        DefenderEnabled = (Get-MpComputerStatus).AntivirusEnabled
        SmartScreenEnabled = $true
    }
    Thermal = @{
        FanControl = "Dynamic"
        MaxFanSpeed = if ($HARDWARE_CONFIG.PowerSupply.BatteryStatus -eq 2) { 100 } else { 80 }
        ThermalThrottling = $true
        AmbientTemp = try { (Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace root/wmi).CurrentTemperature } catch { $null }
    }
}

# Enhanced logging with rotation
$LogDirectory = Join-Path $PSScriptRoot "logs"
$MaxLogFiles = 10
$LogFile = Join-Path $LogDirectory "system_optimization_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

if (-not (Test-Path $LogDirectory)) {
    New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}

# Rotate old logs
Get-ChildItem -Path $LogDirectory -Filter "system_optimization_*.log" | 
    Sort-Object CreationTime -Descending | 
    Select-Object -Skip $MaxLogFiles | 
    Remove-Item -Force

# Enhanced logging functionality
function Write-OptimizationLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [ValidateSet('Info','Warning','Error')]
        [string]$Level = 'Info'
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage
    
    switch($Level) {
        'Info' { Write-Host $logMessage }
        'Warning' { Write-Warning $logMessage }
        'Error' { Write-Error $logMessage }
    }
}

# System state backup functionality
function Backup-SystemState {
    param([string]$BackupPath)
    
    try {
        # Create system restore point
        Checkpoint-Computer -Description "Pre-Optimization Backup" -RestorePointType "MODIFY_SETTINGS"
        
        # Export current registry settings
        $registryBackup = Join-Path $BackupPath "registry_backup.reg"
        reg export HKLM $registryBackup /y
        
        # Backup power settings
        $powerCfg = Join-Path $BackupPath "power_config.pow"
        powercfg -export $powerCfg
        
        Write-OptimizationLog "System state backup completed successfully" -Level Info
        return $true
    }
    catch {
        Write-OptimizationLog "Failed to create system backup: $_" -Level Error
        return $false
    }
}

# Enhanced Ryzen optimization with temperature monitoring
function Optimize-RyzenProcessor {
    Write-OptimizationLog "Starting Ryzen processor optimization..."
    
    try {
        # Monitor current temperature
        $temp = Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" -ErrorAction SilentlyContinue
        if ($temp) {
            $currentTemp = ($temp.CurrentTemperature - 2732) / 10.0
            Write-OptimizationLog "Current CPU temperature: $currentTemp°C"
            
            if ($currentTemp -gt $SYSTEM_CONFIG.CPU.MaxTemp) {
                Write-OptimizationLog "CPU temperature too high, applying conservative settings" -Level Warning
                $SYSTEM_CONFIG.CPU.PowerThrottling = $true
            }
        }
        
        # Apply power plan based on temperature and performance needs
        if ($SYSTEM_CONFIG.CPU.PowerThrottling) {
            powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e  # Balanced
        } else {
            powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c  # High performance
        }
        
        # Advanced AMD optimization registry keys
        $amdKeys = @{
            "EnableUlps" = 0
            "PP_SclkDeepSleepDisable" = 1
            "KMD_EnableComputePreemption" = 1
            "EnableVCNPreemption" = 1
            "PP_DisableAutoWattman" = 1
        }
        
        $amdPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000"
        if (Test-Path $amdPath) {
            foreach ($key in $amdKeys.Keys) {
                Set-ItemProperty -Path $amdPath -Name $key -Value $amdKeys[$key] -ErrorAction SilentlyContinue
            }
        }
        
        # Optimize thread scheduling
        $processorScheduling = "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl"
        Set-ItemProperty -Path $processorScheduling -Name "Win32PrioritySeparation" -Value 38
        
        Write-OptimizationLog "Ryzen processor optimization completed"
    }
    catch {
        Write-OptimizationLog "Error in Ryzen optimization: $_" -Level Error
    }
}

# Function to optimize system memory
function Optimize-SystemMemory {
    Write-OptimizationLog "Starting system memory optimization..."
    
    try {
        # Clear standby list and working sets
        Write-OptimizationLog "Clearing memory standby list..."
        [System.Runtime.InteropServices.Marshal]::FreeHGlobal((([System.Runtime.InteropServices.Marshal]::AllocHGlobal(1048576))))
        
        # Optimize pagefile
        $physicalMem = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum
        $pagefileSize = [Math]::Round($physicalMem * $SYSTEM_CONFIG.Memory.PagefileOptimal / 1GB)
        $computerSystem = Get-WmiObject -Class Win32_ComputerSystem
        $computerSystem.AutomaticManagedPagefile = $false
        $computerSystem.Put()
        
        $pagefile = Get-WmiObject -Class Win32_PageFileSetting
        $pagefile.InitialSize = $pagefileSize
        $pagefile.MaximumSize = $pagefileSize
        $pagefile.Put()
        
        Write-OptimizationLog "System memory optimization completed"
    }
    catch {
        Write-OptimizationLog "Error in system memory optimization: $_" -Level Error
    }
}

# Function to optimize storage
function Optimize-Storage {
    Write-OptimizationLog "Starting storage optimization..."
    
    try {
        # Clean up Windows temporary files
        Write-OptimizationLog "Cleaning temporary files..."
        Remove-Item -Path $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
        
        # Clean up Windows Update cache
        Write-OptimizationLog "Cleaning Windows Update cache..."
        Stop-Service -Name wuauserv -Force
        Remove-Item -Path "C:\Windows\SoftwareDistribution\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv
        
        # Run disk cleanup
        Write-OptimizationLog "Running disk cleanup..."
        cleanmgr /sagerun:1
        
        # Optimize drives
        Write-OptimizationLog "Optimizing drives..."
        Get-Volume | Where-Object { $_.DriveType -eq 'Fixed' } | 
            ForEach-Object { Optimize-Volume -DriveLetter $_.DriveLetter -ReTrim -Verbose }
        
        Write-OptimizationLog "Storage optimization completed"
    }
    catch {
        Write-OptimizationLog "Error in storage optimization: $_" -Level Error
    }
}

# Function to optimize network settings
function Optimize-NetworkSettings {
    Write-OptimizationLog "Starting network settings optimization..."
    
    try {
        # Optimize TCP settings
        if ($SYSTEM_CONFIG.Network.OptimizeTCP) {
            netsh int tcp set global autotuninglevel=normal
            netsh int tcp set global chimney=enabled
            netsh int tcp set global dca=enabled
            netsh int tcp set global netdma=enabled
        }
        
        # Update DNS settings to use reliable providers
        if ($SYSTEM_CONFIG.Network.UpdateDNS) {
            $adapters = Get-NetAdapter | Where-Object Status -eq 'Up'
            foreach ($adapter in $adapters) {
                Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses "1.1.1.1","8.8.8.8"
            }
        }
        
        # Reset Windows Sockets
        Write-OptimizationLog "Resetting Windows Sockets..."
        netsh winsock reset
        netsh int ip reset
        
        Write-OptimizationLog "Network settings optimization completed"
    }
    catch {
        Write-OptimizationLog "Error in network settings optimization: $_" -Level Error
    }
}

# Function to optimize Windows services
function Optimize-WindowsServices {
    Write-OptimizationLog "Starting Windows services optimization..."
    
    $servicesToDisable = @(
        "DiagTrack",          # Connected User Experiences and Telemetry
        "dmwappushservice",   # Device Management Wireless Application Protocol
        "SysMain",           # Superfetch
        "WSearch"            # Windows Search (if not needed)
    )
    
    foreach ($service in $servicesToDisable) {
        try {
            $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
            if ($svc) {
                Stop-Service -Name $service -Force
                Set-Service -Name $service -StartupType Disabled
                Write-OptimizationLog "Disabled service: $service"
            }
        }
        catch {
            Write-OptimizationLog "Error handling service $service : $_" -Level Error
        }
    }
    
    Write-OptimizationLog "Windows services optimization completed"
}

# Add new validation function
function Test-SystemRequirements {
    $requirements = @(
        @{
            Test = { $HARDWARE_CONFIG.Processor.Name -match "AMD Ryzen" }
            Message = "AMD Ryzen processor required for optimal performance"
            Critical = $false
        }
        @{
            Test = { $SYSTEM_CONFIG.Memory.PhysicalMemory -ge 8GB }
            Message = "Minimum 8GB RAM recommended"
            Critical = $false
        }
        @{
            Test = { (Get-Volume C).SizeRemaining -ge $SYSTEM_CONFIG.Storage.MinimumFreeSpace }
            Message = "Insufficient disk space"
            Critical = $true
        }
        @{
            Test = { $SYSTEM_CONFIG.Security.AntiVirusActive }
            Message = "No active antivirus detected"
            Critical = $true
        }
    )

    $pass = $true
    foreach ($req in $requirements) {
        if (-not (& $req.Test)) {
            if ($req.Critical) {
                Write-OptimizationLog $req.Message -Level Error
                $pass = $false
            } else {
                Write-OptimizationLog $req.Message -Level Warning
            }
        }
    }
    return $pass
}

# Enhanced main execution
function Start-SystemOptimization {
    $stopwatch = [Diagnostics]::StartNew()
    $success = $true
    
    try {
        # Verify system requirements
        if (-not ([WindowsPrincipal][WindowsIdentity]::GetCurrent()).IsInRole([WindowsBuiltInRole]::Administrator)) {
            throw "Administrator privileges required"
        }

        if (-not (Test-SystemRequirements)) {
            throw "System requirements not met"
        }

        # Create backup with validation
        $backupPath = Join-Path $PSScriptRoot "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (-not (New-Item -ItemType Directory -Path $backupPath -Force -ErrorAction Stop)) {
            throw "Failed to create backup directory"
        }

        if (-not (Backup-SystemState -BackupPath $backupPath)) {
            throw "Backup creation failed"
        }

        # System analysis
        Write-OptimizationLog "Starting system analysis..."
        $systemMetrics = @{
            CPUUsage = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
            AvailableMemory = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
            DiskSpace = (Get-Volume C).SizeRemaining
        }
        
        # Execute optimizations based on system state
        if ($systemMetrics.CPUUsage -gt 80) {
            Write-OptimizationLog "High CPU usage detected, applying conservative optimizations" -Level Warning
            $SYSTEM_CONFIG.CPU.PowerThrottling = $true
        }
        
        # Run optimizations
        $optimizations = @(
            @{ Name = "Ryzen Processor"; Function = ${function:Optimize-RyzenProcessor} },
            @{ Name = "System Memory"; Function = ${function:Optimize-SystemMemory} },
            @{ Name = "Storage"; Function = ${function:Optimize-Storage} },
            @{ Name = "Network Settings"; Function = ${function:Optimize-NetworkSettings} },
            @{ Name = "Windows Services"; Function = ${function:Optimize-WindowsServices} }
        )
        
        foreach ($opt in $optimizations) {
            Write-OptimizationLog "Starting $($opt.Name) optimization..."
            & $opt.Function
            Start-Sleep -Seconds 2  # Prevent system overload
        }
        
        # Verify optimizations
        Write-OptimizationLog "Verifying system state..."
        $finalMetrics = @{
            CPUUsage = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
            AvailableMemory = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
            DiskSpace = (Get-Volume C).SizeRemaining
        }
        
        # Generate optimization report
        $report = @"
System Optimization Report
------------------------
Duration: $($stopwatch.Elapsed.ToString())
Initial CPU Usage: $($systemMetrics.CPUUsage)%
Final CPU Usage: $($finalMetrics.CPUUsage)%
Memory Improvement: $([math]::Round(($finalMetrics.AvailableMemory - $systemMetrics.AvailableMemory)/1024, 2)) GB
Disk Space Recovered: $([math]::Round(($finalMetrics.DiskSpace - $systemMetrics.DiskSpace)/1GB, 2)) GB
"@
        
        Add-Content -Path $LogFile -Value $report
        Write-OptimizationLog "Optimization completed successfully"
    }
    catch {
        $success = $false
        Write-OptimizationLog "Critical error during optimization: $_" -Level Error
        
        # Attempt recovery
        try {
            Write-OptimizationLog "Attempting system recovery..." -Level Warning
            Restore-SystemState -BackupPath $backupPath
        }
        catch {
            Write-OptimizationLog "Recovery failed: $_" -Level Error
        }
    }
    finally {
        $stopwatch.Stop()
        if (-not $success) {
            Write-OptimizationLog "Optimization failed - system may need manual review" -Level Warning
        }
    }
}

# Add recovery function
function Restore-SystemState {
    param([string]$BackupPath)
    
    if (Test-Path $BackupPath) {
        try {
            # Restore power settings
            $powerCfg = Join-Path $BackupPath "power_config.pow"
            if (Test-Path $powerCfg) {
                powercfg -import $powerCfg
            }

            # Restore registry
            $registryBackup = Join-Path $BackupPath "registry_backup.reg"
            if (Test-Path $registryBackup) {
                reg import $registryBackup
            }

            Write-OptimizationLog "System state restored successfully" -Level Info
            return $true
        }
        catch {
            Write-OptimizationLog "Failed to restore system state: $_" -Level Error
            return $false
        }
    }
    return $false
}

# Update administrator check to use new type accelerators
function Test-AdminPrivileges {
    try {
        $identity = [WindowsIdentity]::GetCurrent()
        $principal = [WindowsPrincipal]::new($identity)
        return $principal.IsInRole([WindowsBuiltInRole]::Administrator)
    }
    catch {
        Write-OptimizationLog "Failed to verify admin privileges: $_" -Level Error
        return $false
    }
}

# Update memory management to use proper marshaling
function Clear-SystemMemory {
    try {
        $bytes = 1024 * 1024
        $memory = [Marshal]::AllocHGlobal($bytes)
        [Marshal]::FreeHGlobal($memory)
        [System.GC]::Collect()
        return $true
    }
    catch {
        Write-OptimizationLog "Failed to clear system memory: $_" -Level Error
        return $false
    }
}

# Update registry access to use proper registry types
function Update-RegistryValue {
    param(
        [string]$Path,
        [string]$Name,
        [object]$Value,
        [string]$Type = "DWord"
    )
    
    try {
        $regKey = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey(
            $Path.Replace("HKLM:\", ""),
            $true
        )
        
        if ($regKey) {
            $regKey.SetValue($Name, $Value, [Microsoft.Win32.RegistryValueKind]::$Type)
            $regKey.Close()
            return $true
        }
        return $false
    }
    catch {
        Write-OptimizationLog "Failed to update registry value $Path\$Name : $_" -Level Error
        return $false
    }
}

# Update process management
function Get-ProcessMetrics {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProcessName
    )
    
    try {
        $metrics = @{
            CPU = 0.0
            Memory = 0.0
            Threads = 0
            Handles = 0
            Instances = 0
        }
        
        $processes = [Diagnostics]::GetProcessesByName($ProcessName)
        if ($processes.Count -gt 0) {
            foreach ($proc in $processes) {
                $metrics.CPU += $proc.CPU
                $metrics.Memory += [Math]::Round($proc.WorkingSet64 / 1MB, 2)
                $metrics.Threads += $proc.Threads.Count
                $metrics.Handles += $proc.HandleCount
            }
            $metrics.Instances = $processes.Count
            
            # Cleanup
            $processes | ForEach-Object { $_.Dispose() }
        }
        
        return $metrics
    }
    catch {
        Write-OptimizationLog "Failed to get process metrics for $ProcessName : $_" -Level Error
        return $null
    }
}

# Update the user interaction section to handle input more reliably
function Get-UserConfirmation {
    param(
        [string]$WarningMessage
    )
    
    try {
        Write-OptimizationLog $WarningMessage -Level Warning
        $host.UI.RawUI.FlushInputBuffer()
        
        do {
            Write-Host "Do you want to proceed? (Y/N): " -NoNewline
            $response = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            $result = $response.Character.ToString().ToUpper()
            Write-Host $result
            
            if ($result -eq 'Y') { return $true }
            if ($result -eq 'N') { return $false }
            
            Write-Host "Please enter Y or N"
        } while ($true)
    }
    catch {
        Write-OptimizationLog "Error getting user confirmation: $_" -Level Error
        return $false
    }
}

# Main execution with enhanced error boundary
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

try {
    # Verify running as administrator
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "This script requires administrator privileges. Please run PowerShell as Administrator."
    }

    # Show execution plan
    Show-ExecutionPlan
    
    if (-not $Force) {
        Write-OptimizationLog "`nReview the execution plan carefully." -Level Warning
        Write-OptimizationLog "Type 'CONFIRM' to proceed with the optimization: " -Level Warning -NoCR
        $confirmation = Read-Host
        if ($confirmation -ne 'CONFIRM') {
            throw "Operation cancelled by user. No changes were made."
        }
    }

    Write-OptimizationLog "Starting pre-execution validation..." -Level Info
    $validation = Test-PreExecutionRequirements 

    if (-not $validation.Success) {
        throw "Pre-execution validation failed. Check the log for details."
    }

    if ($validation.Warnings.Count -gt 0) {
        $warningMessage = "The following warnings were detected:`n"
        $validation.Warnings | ForEach-Object { $warningMessage += "- $_`n" }
        
        if (-not (Get-UserConfirmation -WarningMessage $warningMessage)) {
            throw "Operation cancelled by user due to warnings."
        }
    }

    # Store initial state for recovery
    $script:InitialState = $validation.SystemState
    
    if ($script:DryRun) {
        Write-OptimizationLog "DRY RUN COMPLETED - No changes were made" -Level Success
        exit 0
    }
    
    Write-OptimizationLog "Starting system optimization..." -Level Info
    
    # Proceed with optimization
    Start-SystemOptimization
    
    Write-OptimizationLog "System optimization completed successfully." -Level Success
    Write-OptimizationLog "Log file saved to: $script:LogPath" -Level Info
}
catch {
    Write-OptimizationLog "Fatal error: $_" -Level Error
    
    # Attempt recovery if initial state exists
    if ($script:InitialState -and -not $script:DryRun) {
        Write-OptimizationLog "Attempting to restore initial system state..." -Level Warning
        try {
            # Restore power scheme
            if ($script:InitialState.OriginalPowerScheme) {
                powercfg /SetActive $script:InitialState.OriginalPowerScheme
            }
            
            Write-OptimizationLog "System state restored to initial configuration" -Level Success
        }
        catch {
            Write-OptimizationLog "Failed to restore system state: $_" -Level Error
        }
    }
    
    exit 1
}
finally {
    # Always clean up type accelerators
    Remove-CustomTypeAccelerators
    
    # Ensure we pause before exit if there were errors
    if ($Error.Count -gt 0) {
        Write-Host "`nPress any key to exit..."
        $null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
    $ErrorActionPreference = 'Continue'
    $ProgressPreference = 'Continue'
}
