# SSH Setup Guide for GitHub

This guide will help you set up SSH keys for GitHub so you can push your code.

## Step 1: Generate SSH Key

Open your terminal and run:

```bash
ssh-keygen -t ed25519 -C "girmaynl21@gmail.com"
```

**When prompted:**
- **"Enter file in which to save the key"**: Press Enter (uses default location: `~/.ssh/id_ed25519`)
- **"Enter passphrase"**: You can press Enter for no passphrase, OR enter a password for extra security
- **"Enter same passphrase again"**: Press Enter again (or repeat your password)

## Step 2: Start SSH Agent

```bash
eval "$(ssh-agent -s)"
```

## Step 3: Add SSH Key to SSH Agent

```bash
ssh-add ~/.ssh/id_ed25519
```

## Step 4: Copy Your Public Key

**Copy the public key to your clipboard:**

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

This copies your public key to your clipboard. You'll see no output, but it's copied!

**OR if `pbcopy` doesn't work, display it and copy manually:**

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the entire output (it starts with `ssh-ed25519` and ends with your email).

## Step 5: Add SSH Key to GitHub

1. **Go to GitHub**: Open https://github.com in your browser
2. **Click your profile** (top right) → **Settings**
3. **Click "SSH and GPG keys"** in the left sidebar
4. **Click "New SSH key"** (green button)
5. **Fill in the form**:
   - **Title**: Give it a name like "MacBook Air" or "My Mac"
   - **Key**: Paste your public key (from Step 4)
6. **Click "Add SSH key"**
7. **Enter your GitHub password** if prompted

## Step 6: Test SSH Connection

Test if everything works:

```bash
ssh -T git@github.com
```

**Expected output:**
```
Hi girmay-ak! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see this, it means SSH is working! ✅

## Step 7: Push Your Branch

Now you can push your branch:

```bash
cd /Users/girmaybaraki/Documents/APP-2026/taalmeet-app-v1
git push -u origin feature/login-ui-and-chat-docs
```

---

## Troubleshooting

### If you get "Permission denied" error:

1. **Check if your key is added to ssh-agent:**
   ```bash
   ssh-add -l
   ```

2. **If empty, add it again:**
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```

### If you prefer HTTPS instead:

If SSH setup is too complicated, you can use HTTPS:

```bash
cd /Users/girmaybaraki/Documents/APP-2026/taalmeet-app-v1
git remote set-url origin https://github.com/girmay-ak/taalmeet-app-v1.git
git push -u origin feature/login-ui-and-chat-docs
```

(You'll be prompted for your GitHub username and password/token)

---

## Quick Commands Summary

```bash
# 1. Generate key
ssh-keygen -t ed25519 -C "girmaynl21@gmail.com"

# 2. Start agent
eval "$(ssh-agent -s)"

# 3. Add key to agent
ssh-add ~/.ssh/id_ed25519

# 4. Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy

# 5. Test connection
ssh -T git@github.com

# 6. Push branch
cd /Users/girmaybaraki/Documents/APP-2026/taalmeet-app-v1
git push -u origin feature/login-ui-and-chat-docs
```

