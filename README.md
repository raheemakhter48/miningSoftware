# Web3 Mining Simulator 🚀

A full-stack, educational, and functional Web3 mining and automation system. Simulate crypto mining, distribute real ERC20 tokens on Sepolia testnet, store logs in the cloud, and leverage decentralized storage and automation—all in one modern app.

---

## 🌟 Features
- **Proof-of-Work Mining Simulation** (frontend, real-time, interactive)
- **MetaMask Wallet Connect** (Ethers.js, multi-network ready)
- **Token Balance & Faucet** (real ERC20 on Sepolia testnet)
- **Mining Logs** (stored in Supabase and SQLite, viewable in-app)
- **Decentralized Storage** (IPFS via Infura)
- **Automation Ready** (n8n integration for alerts, workflows)
- **Modern UI** (Next.js, TailwindCSS, fully responsive)
- **Python FastAPI Backend** (with SQLite, REST API)

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), TailwindCSS, Ethers.js
- **Backend:** FastAPI (Python), SQLite, SQLAlchemy
- **Blockchain:** Solidity (ERC20, Sepolia testnet)
- **Cloud DB:** Supabase
- **Decentralized Storage:** IPFS (Infura)
- **Automation:** n8n (optional)

---

## 🚀 Getting Started

### 1. Clone the Repo
```sh
git clone https://github.com/yourusername/mining-tool.git
cd mining-tool
```

### 2. Setup Environment Variables
#### In `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_sepolia_contract_address
```
#### In `backend/.env` (optional for IPFS):
```
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_project_secret
```

### 3. Install Dependencies
#### Frontend
```sh
cd frontend
npm install
```
#### Backend
```sh
cd ../backend
pip install -r requirements.txt
```

### 4. Run the App
#### Backend (from `backend/`):
```sh
uvicorn main:app --reload
```
#### Frontend (from `frontend/`):
```sh
npm run dev
```

---

## 🧑‍💻 Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Connect your MetaMask wallet (Sepolia testnet).
- Start mining, claim tokens, view logs, and upload logs to IPFS.
- Use the backend API at [http://localhost:8000/docs](http://localhost:8000/docs) for advanced features.

---

## 📝 Smart Contract
- ERC20 + Faucet contract deployed on Sepolia testnet.
- Update your contract address in `.env.local` after deployment.

---

## 🌐 Deployment
- **Frontend:** Deploy to Vercel, Netlify, or your favorite cloud.
- **Backend:** Deploy to any Python host (Render, Railway, etc.)
- Set environment variables in your cloud dashboard.

---

## 🤖 Automation (n8n)
- Integrate n8n for alerts, token distribution, and more via webhooks.
- Example: Send Telegram/email alerts on mining events.

---

## ❤️ Credits & License
- Built by Raheem Akhtar.
- Educational use only. Not for real mining or financial use.
- MIT License.

---

## 🦾 Pro Tips
- Use [DB Browser for SQLite](https://sqlitebrowser.org/) to view backend data.
- Use [Supabase Studio](https://app.supabase.com/) to manage cloud logs.
- Use [Etherscan Sepolia](https://sepolia.etherscan.io/) to view contract activity.

---

## 📬 Need Help?
Open an issue or reach out on GitHub. Happy mining! 🚀
