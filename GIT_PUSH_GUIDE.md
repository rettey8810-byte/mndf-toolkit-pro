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

This project is configured to use **SSH authentication**. SSH is the permanent fix that stops GitHub browser login prompts.

### 1) Verify SSH key works

```powershell
ssh -T git@github.com
```

Expected message:

`Hi rettey8810-byte! You've successfully authenticated, but GitHub does not provide shell access.`

Note: the first time you run this, it may ask:

`Are you sure you want to continue connecting (yes/no/[fingerprint])?`

Type `yes`.

### 2) Verify remote is SSH

```powershell
git remote -v
```

Expected:

`origin  git@github.com:rettey8810-byte/mndf-toolkit-pro.git (fetch)`

`origin  git@github.com:rettey8810-byte/mndf-toolkit-pro.git (push)`

## Verify Setup

Check your remote URL:
```powershell
git remote get-url origin
```

Should show: `git@github.com:rettey8810-byte/mndf-toolkit-pro.git`

## Full Setup (If Starting Fresh)

```powershell
# Configure git
git config --global user.name "Rettey"
git config --global user.email "rettey8810-byte@users.noreply.github.com"

# Generate SSH key (run once)
ssh-keygen -t ed25519 -C "rettey8810-byte@github.com" -f $env:USERPROFILE\.ssh\id_ed25519

# Add the public key to GitHub:
# https://github.com/settings/keys
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Switch remote to SSH
git remote set-url origin git@github.com:rettey8810-byte/mndf-toolkit-pro.git

# Test push
git push origin main
```

## Quick Push Using push.bat (Optional)

This repo includes a helper script `push.bat`.

Run:

```powershell
./push.bat "your commit message"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSH asks for `yes/no` | Type `yes` once (adds GitHub to known hosts) |
| `Permission denied (publickey)` | SSH key not added to GitHub or wrong key: re-add the key from `~\.ssh\id_ed25519.pub` |
| "Could not resolve host" | Check internet connection |
| "Nothing to commit" | No changes to push - make edits first |

---
Last Updated: April 2026
