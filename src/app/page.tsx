"use client";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { supabase } from "../utils/supabaseClient";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xYourTokenContractAddress";
const CONTRACT_ABI = [
  "function faucet() public",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

function shortenAddress(addr: string) {
  return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
}

function randomHash() {
  // Simulate a random hash (not cryptographically secure)
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mining, setMining] = useState(false);
  const [uptime, setUptime] = useState("00:00:00");
  const [hashRate, setHashRate] = useState("0 H/s");
  const [tokenBalance, setTokenBalance] = useState("0.00");
  const [logs, setLogs] = useState<string[]>(["System initialized."]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetTx, setFaucetTx] = useState<string | null>(null);

  // Mining simulation refs
  const miningRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const hashCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mining simulation logic
  useEffect(() => {
    if (mining) {
      miningRef.current = true;
      startTimeRef.current = Date.now();
      hashCountRef.current = 0;
      setLogs((prev) => ["Mining started.", ...prev]);
      // Mining loop
      function mine() {
        if (!miningRef.current) return;
        let hashes = 0;
        const start = performance.now();
        while (performance.now() - start < 100) {
          randomHash();
          hashes++;
        }
        hashCountRef.current += hashes;
        setHashRate(`${(hashes * 10).toLocaleString()} H/s`);
        setLogs((prev) => [`Mined ${hashes} hashes.`, ...prev.slice(0, 99)]);
        if (miningRef.current) setTimeout(mine, 100);
      }
      mine();
      // Uptime interval
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
          const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
          const s = String(elapsed % 60).padStart(2, "0");
          setUptime(`${h}:${m}:${s}`);
        }
      }, 1000);
    } else {
      miningRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setHashRate("0 H/s");
      setLogs((prev) => ["Mining stopped.", ...prev]);
    }
    return () => {
      miningRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mining]);

  // Fetch token balance
  const fetchTokenBalance = async () => {
    if (!wallet || !(window as typeof window & { ethereum?: any })?.ethereum) return;
    setLoadingBalance(true);
    try {
      const provider = new ethers.BrowserProvider((window as typeof window & { ethereum?: any })?.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const decimals = await contract.decimals();
      const bal = await contract.balanceOf(wallet);
      setTokenBalance(ethers.formatUnits(bal, decimals));
    } catch (err: unknown) {
      if (err instanceof Error) setError("Failed to fetch token balance: " + err.message);
      else setError("Failed to fetch token balance: Unknown error");
    }
    setLoadingBalance(false);
  };

  // Claim faucet
  const claimFaucet = async () => {
    if (!wallet || !(window as typeof window & { ethereum?: any })?.ethereum) return;
    setFaucetLoading(true);
    setFaucetTx(null);
    try {
      const provider = new ethers.BrowserProvider((window as typeof window & { ethereum?: any })?.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.faucet();
      setFaucetTx(tx.hash);
      setLogs((prev) => ["Faucet transaction sent: " + tx.hash, ...prev]);
      await tx.wait();
      setLogs((prev) => ["Faucet claim successful!", ...prev]);
      fetchTokenBalance();
    } catch (err: unknown) {
      if (err instanceof Error) setError("Faucet claim failed: " + (err.reason || err.message));
      else setError("Faucet claim failed: Unknown error");
    }
    setFaucetLoading(false);
  };

  // Store log in Supabase
  const addLog = (message: string) => {
    setLogs((prev) => [message, ...prev.slice(0, 99)]);
    if (wallet) {
      supabase.from("mining_logs").insert({ wallet, message }).then();
    }
  };

  // Fetch logs from Supabase
  async function fetchLogs() {
    if (!wallet) return;
    const { data, error } = await supabase
      .from("mining_logs")
      .select("message, created_at")
      .eq("wallet", wallet)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) {
      setLogs(data.map((row: { message: string; created_at: string }) => row.message));
    }
  }

  // Fetch logs on wallet change
  useEffect(() => {
    fetchLogs();
  }, [wallet]);

  // Fetch balance on wallet/network change
  useEffect(() => {
    fetchTokenBalance();
  }, [wallet, network]);

  // Connect wallet
  const connectWallet = async () => {
    setError(null);
    if (!(window as typeof window & { ethereum?: any })?.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as typeof window & { ethereum?: any })?.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWallet(accounts[0]);
      const net = await provider.getNetwork();
      setNetwork(net.name + ` (#${net.chainId})`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || "Failed to connect wallet.");
      else setError("Failed to connect wallet: Unknown error");
    }
  };

  // Disconnect wallet (just clears state)
  const disconnectWallet = () => {
    setWallet(null);
    setNetwork(null);
    setError(null);
  };

  // Listen for account/network changes
  useEffect(() => {
    if (!(window as typeof window & { ethereum?: any })?.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setWallet(accounts[0]);
    };
    const handleChainChanged = () => {
      connectWallet();
    };
    (window as typeof window & { ethereum?: any })?.ethereum.on("accountsChanged", handleAccountsChanged);
    (window as typeof window & { ethereum?: any })?.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      if ((window as typeof window & { ethereum?: any })?.ethereum.removeListener) {
        (window as typeof window & { ethereum?: any })?.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as typeof window & { ethereum?: any })?.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#0a0a0a] dark:to-[#232323] text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center py-6 px-4 md:px-12 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Web3 Mining Simulator</h1>
        <div className="flex flex-col items-end gap-1">
          {wallet ? (
            <>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform" onClick={disconnectWallet}>
                Disconnect ({shortenAddress(wallet)})
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-300">{network}</span>
            </>
          ) : (
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-8 p-4 md:p-12 max-w-6xl w-full mx-auto">
        {/* Left: Mining & Token Cards */}
        <section className="flex-1 flex flex-col gap-8">
          {/* Mining Status Card */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mining Status</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${mining ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{mining ? "Active" : "Stopped"}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between"><span>Uptime:</span><span>{uptime}</span></div>
              <div className="flex justify-between"><span>Hash Rate:</span><span>{hashRate}</span></div>
            </div>
            <button className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-colors ${mining ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`} onClick={() => setMining(!mining)}>{mining ? "Stop Mining" : "Start Mining"}</button>
          </div>

          {/* Token Balance Card */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Token Balance</h2>
              <span className="text-lg font-mono">{loadingBalance ? "..." : tokenBalance} TEST</span>
            </div>
            <button className="mt-2 px-6 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors" onClick={fetchTokenBalance} disabled={loadingBalance}>
              {loadingBalance ? "Refreshing..." : "Refresh Balance"}
            </button>
          </div>

          {/* Faucet Card */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Token Faucet</h2>
            </div>
            <button className="px-6 py-2 rounded-lg font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors" onClick={claimFaucet} disabled={faucetLoading}>
              {faucetLoading ? "Requesting..." : "Request Test Tokens"}
            </button>
            {faucetTx && (
              <a href={`https://sepolia.etherscan.io/tx/${faucetTx}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 mt-2 underline">View Transaction</a>
            )}
          </div>
        </section>

        {/* Right: Log Area */}
        <section className="flex-1 max-w-xl w-full flex flex-col">
          <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">System Logs</h2>
            <div className="flex-1 overflow-y-auto max-h-96 bg-black/5 dark:bg-white/5 rounded-lg p-3 text-xs font-mono space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-700 dark:text-gray-300">{log}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur-md">
        &copy; {new Date().getFullYear()} Web3 Mining Simulator. Educational use only.
      </footer>
    </div>
  );
}
