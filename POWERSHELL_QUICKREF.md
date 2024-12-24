# PowerShell Quick Reference Guide

## 🚀 Running the Diagnostic Script

### Step 1: Choose the Right PowerShell Version
For our diagnostic script, use "Windows PowerShell" with "Run as Administrator":

1. Press Windows key
2. Type "powershell"
3. Click "Run as Administrator" on the right panel
4. Click "Yes" when prompted for permissions

### Step 2: Navigate to Directory
```powershell
# Change to the project directory
cd "C:\Users\ihelp\Comprehensive_Resource_Library\Comp_Res_Lib_V2"

# Verify you're in the right directory
pwd
```

### Step 3: Enable Script Execution
```powershell
# One-time setup: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Run the Script
```powershell
# Run the diagnostic script
.\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1
```

## 📚 Common PowerShell Commands

### Directory Navigation
```powershell
cd "path\to\directory"    # Change directory
pwd                       # Show current directory
ls                        # List files
dir                       # Alternative to ls
```

### File Operations
```powershell
cat filename.txt          # View file contents
copy source.txt dest.txt  # Copy file
move source.txt dest.txt  # Move file
rm filename.txt          # Delete file
```

### Network Commands
```powershell
Test-NetConnection        # Test network connectivity
Resolve-DnsName          # DNS lookup
ping hostname            # Test host reachability
```

### Common Flags
```powershell
-ErrorAction Stop        # Stop on errors
-Verbose                # Show detailed output
-Force                  # Force operation
-WhatIf                # Show what would happen
```

## 🔧 Troubleshooting Common Issues

### Script Won't Run
```powershell
# Error: "...cannot be loaded because running scripts is disabled"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Error: "...not digitally signed"
Unblock-File -Path .\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1
```

### Path Issues
```powershell
# Verify script exists
Test-Path .\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1

# Show full path
Resolve-Path .\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1
```

### Permission Issues
```powershell
# Check current user
whoami

# Check execution policy
Get-ExecutionPolicy -List
```

## 🎯 Best Practices

1. Always run as Administrator for system-level operations
2. Use `Test-Path` before accessing files
3. Use `try-catch` blocks for error handling
4. Use `-Verbose` for detailed output when troubleshooting

## 🚫 Common Errors and Solutions

### Access Denied
```powershell
# Solution: Run as Administrator
Start-Process powershell -Verb RunAs
```

### File Not Found
```powershell
# Solution: Verify path and location
dir *.ps1
```

### Execution Policy
```powershell
# Solution: Set appropriate policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
