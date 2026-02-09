# Deploying AntiGaspi to Hetzner

This guide covers everything from creating the server on Hetzner to deploying your app.

## Phase 1: Create the Server (On Hetzner Website)
1.  **Log in** to your [Hetzner Cloud Console](https://console.hetzner.cloud).
2.  **Create a Project**: Name it `antigaspi`.
3.  **Add Server**:
    - **Location**: Choose essentialy any location (e.g. Nuremberg or Falkenstein).
    - **Image**: Select **Ubuntu 24.04** (or 22.04).
    - **Type**: **Shared vCPU** -> **Arm64** (Cheaper/Faster) OR **x86** (Intel/AMD).
        - Recommend: CAX11 (Arm64) or CX22 (x86). Approx €4-5/month.
    - **Networking**: Public IPv4 (and IPv6).
    - **SSH Key**: Add your public SSH key (optional but recommended for security). If you don't know how, just select "Email" to receive a root password.
    - **Name**: `antigaspi-prod`.
4.  **Create & Buy**: Click "Create & Buy now".
5.  **Wait**: In a few seconds, you will see your server's **Public IP Address** (e.g., `123.45.67.89`).

## Phase 2: Configure Domain Name (DNS)
1.  Go to where you bought your domain (`nogaspi.com`).
2.  Find the **DNS Management** or **Zone Editor** section.
3.  Add the following records:
    - **Type**: `A` | **Name**: `@` | **Value**: `YOUR_SERVER_IP`
    - **Type**: `A` | **Name**: `www` | **Value**: `YOUR_SERVER_IP`
    - *(If you have IPv6, add AAAA records too, but A record is most important)*.
4.  Wait 5-10 minutes for DNS to propagate.

## Phase 3: Initial Server Setup (Terminal)
Open your terminal (PowerShell or CMD on Windows).

1.  **Connect to your server**:
    ```powershell
    ssh root@YOUR_SERVER_IP
    # If using password, paste it when prompted (you won't see characters typing).
    ```
2.  **Update system & Install Docker**:
    Copy-paste this entire block:
    ```bash
    apt update && apt upgrade -y
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable --now docker
    ```

## Phase 4: Upload Project Files
Leave the SSH session (type `exit`) or open a **new** terminal window on your PC.
Navigate to your project folder:
```powershell
cd C:\Users\HP\source\repos\AntiGaspi\antigaspi
```

Upload the files to the server:
```powershell
# Replace 123.45.67.89 with your actual server IP
scp -r backend-dotnet client docker-compose.prod.yml Caddyfile root@123.45.67.89:/root/antigaspi
```

## Phase 5: Configure & Launch
1.  **Connect back to the server**:
    ```powershell
    ssh root@YOUR_SERVER_IP
    cd antigaspi
    ```

2.  **Create .env file**:
    ```bash
    nano .env
    ```
    Paste your secrets (Right-click to paste in some terminals):
    ```env
    DB_PASSWORD=SecurePassword123!
    JWT_SECRET=super-long-secure-secret-key-that-is-at-least-32-chars
    BREVO_API_KEY=xkeysib-ton-clé-api-brevo
    ClientAppUrl=https://nogaspi.com
    # SenderEmail/Name gérés par les templates Brevo directement
    ```# Add VITE_API_URL if needed, but it's handled in build args
    ```
    Save: `Ctrl+X`, then `Y`, then `Enter`.

3.  **Start the App**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

    docker-compose -f docker-compose.prod.yml up -d --build
    ```

## Phase 6: Verify
- Go to `https://nogaspi.com`.
- Caddy automatically gets SSL certificates.
- Enjoy!

## Phase 7: Daily Updates (Git Workflow)
Now that your server is set up with Git, deploying updates is easy:

1.  **On your PC**:
    ```powershell
    git add .
    git commit -m "Your specific message"
    git push origin main
    ```

2.  **On the Server**:
    ```bash
    ssh root@77.42.90.107
    cd antigaspi
    git pull
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
