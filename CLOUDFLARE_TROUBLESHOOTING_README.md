# CloudFlare Configuration Troubleshooting Guide

## 🚨 Current Issue: 522 Connection Timeout for www.ihelper.tech

### Step-by-Step Diagnostic Process

#### Prerequisites
1. CloudFlare Account
2. GitHub Repository Access
3. Basic understanding of DNS and web hosting

### Diagnostic Toolkit

#### 1. Run Diagnostics Script

##### Important: PowerShell Version Selection
1. Press the Windows key
2. Type "powershell"
3. Choose "Windows PowerShell" (NOT ISE or Developer version)
4. Click "Run as Administrator" on the right panel
5. Click "Yes" when prompted for permissions

##### Running the Script
```powershell
# Step 1: Enable script execution (one-time setup)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Step 2: Navigate to project directory
cd "C:\Users\ihelp\Comprehensive_Resource_Library\Comp_Res_Lib_V2"

# Step 3: Run the diagnostic script
.\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1
```

##### Common Script Errors and Solutions
1. "Cannot be loaded because running scripts is disabled"
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. "File not found" or "Path error"
   ```powershell
   # Verify you're in the correct directory
   pwd
   
   # List all PS1 files
   dir *.ps1
   ```

3. "Access denied"
   - Ensure you're running PowerShell as Administrator
   - Check file permissions: `Get-Acl .\CLOUDFLARE_TROUBLESHOOTING_GUIDE.ps1`

For more PowerShell commands and troubleshooting tips, see: [POWERSHELL_QUICKREF.md](./POWERSHELL_QUICKREF.md)

#### 2. GitHub Secrets Configuration
- Go to your GitHub repository
- Navigate to Settings > Secrets and Variables > Actions
- Verify/Add the following secrets:
  1. `CLOUDFLARE_API_TOKEN`
  2. `CLOUDFLARE_ZONE_ID`
  3. `CLOUDFLARE_ACCOUNT_ID`

#### 3. CloudFlare Pages Deployment
- Log into CloudFlare Dashboard
- Go to Pages section
- Select your project (ihelper-library)
- Check deployment status
- Verify custom domain settings

#### 4. DNS Configuration Checklist
```yaml
Root Domain (ihelper.tech):
  Type: CNAME
  Name: @
  Content: ihelper-library.pages.dev
  Proxy: Yes

WWW Subdomain:
  Type: CNAME
  Name: www
  Content: ihelper-library.pages.dev
  Proxy: Yes
```

### Troubleshooting Potential Causes

#### A. Origin Server Connection
- Ensure your origin server (Pages deployment) is active
- Check CloudFlare IP ranges are not blocked
- Verify SSL/TLS settings

#### B. DNS Propagation
- Wait 24-48 hours for DNS changes to fully propagate
- Use online DNS propagation checkers

#### C. SSL/TLS Configuration
- Minimum TLS version: 1.2
- Enable TLS 1.3
- Use Full (Strict) SSL mode

### Required Screenshots/Information

When you run the diagnostic script, please provide:
1. Full script output
2. Screenshot of CloudFlare Pages deployment settings
3. Screenshot of DNS configuration in CloudFlare
4. Screenshot of GitHub repository secrets page (with sensitive info blurred)

### Recommended Actions
1. Run diagnostic script
2. Review and screenshot results
3. Verify GitHub secrets
4. Check CloudFlare Pages deployment
5. Confirm DNS settings

### Need More Help?
If issues persist, prepare the following information:
- Diagnostic script output
- Screenshots requested above
- Any error messages encountered

### Warning ⚠️
- Do NOT share full API tokens or sensitive credentials
- Blur out sensitive information in screenshots

### Support
For personalized assistance, compile the requested information and we'll provide targeted guidance.
