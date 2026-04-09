# Git Push Guide - MNDF Toolkit Pro

## Quick Push Commands

Open PowerShell in project folder and run:

```powershell
cd c:\Users\maushaz.MADIHAA\Desktop\Rettey\mndf_tool_kit\mndf-toolkit-pro
git add -A
git commit -m "Your commit message"
git push origin main
```

## If Authentication Fails

### Option 1: Use Token in Remote URL (Already Configured)
Your token is embedded in the remote URL. This should work without login prompts.

### Option 2: Manual Token Entry
If prompted for password, enter your GitHub token:
- **Token**: `ghp_FvKfQuEf31Ss6TVH5LGM1AH7FpGYxV0rn0Yp`
- Use this as the password when prompted

### Option 3: Cache Credentials
Run once to cache credentials for future:
```powershell
git config --global credential.helper cache --timeout=3600
```

## Verify Setup

Check your remote URL:
```powershell
git remote get-url origin
```

Should show: `https://ghp_...github.com/rettey8810-byte/mndf-toolkit-pro.git`

## Full Setup (If Starting Fresh)

```powershell
# Configure git
git config --global user.name "Rettey"
git config --global user.email "rettey@example.com"
git config --global credential.helper manager

# Set remote with token
git remote set-url origin https://ghp_FvKfQuEf31Ss6TVH5LGM1AH7FpGYxV0rn0Yp@github.com/rettey8810-byte/mndf-toolkit-pro.git

# Test push
git push origin main
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Token may have expired. Use new token from GitHub Settings > Developer Settings > Personal Access Tokens |
| "Could not resolve host" | Check internet connection |
| "Nothing to commit" | No changes to push - make edits first |

## GitHub Token Location
Current token stored in: GitHub remote URL (ghp_FvKfQuEf31Ss6TVH5LGM1AH7FpGYxV0rn0Yp)

---
Last Updated: April 2025
