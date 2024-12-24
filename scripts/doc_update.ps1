#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Manages the living documentation for the Comprehensive Resource Library project
.DESCRIPTION
    Provides utilities for updating, tracking, and managing project documentation
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = 'view',

    [Parameter(Mandatory=$false)]
    [string]$Category = 'all',

    [Parameter(Mandatory=$false)]
    [string]$Version = '0.1.0'
)

# Paths
$DocPath = "$PSScriptRoot\..\doc\COMPREHENSIVE_PROJECT_ANALYSIS.md"
$LogPath = "$PSScriptRoot\..\logs\doc_updates.log"

function Update-DocumentVersion {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $newVersion = [version]$Version
    $content = Get-Content $DocPath -Raw
    $updatedContent = $content -replace "Version: \d+\.\d+\.\d+", "Version: $newVersion"
    $updatedContent = $updatedContent -replace "Last Updated: \d{4}-\d{2}-\d{2}", "Last Updated: $(Get-Date -Format 'yyyy-MM-dd')"
    
    Set-Content -Path $DocPath -Value $updatedContent
    Add-Content -Path $LogPath -Value "[$timestamp] Document updated to version $newVersion"
}

function View-DocumentSection {
    param([string]$Section)
    
    $content = Get-Content $DocPath
    switch ($Section) {
        'overview' { $startLine = $content.IndexOf('## 🔍 Project Overview') }
        'findings' { $startLine = $content.IndexOf('## 🚨 Critical Findings') }
        'actions' { $startLine = $content.IndexOf('## 🛠 Recommended Action Items') }
        default { $startLine = 0 }
    }

    $content[$startLine..($content.Length-1)] | More
}

switch ($Action) {
    'update' { Update-DocumentVersion }
    'view' { 
        if ($Category -ne 'all') {
            View-DocumentSection -Section $Category
        }
        else {
            Get-Content $DocPath | More
        }
    }
    default { Write-Host "Invalid action. Use 'update' or 'view'." }
}
