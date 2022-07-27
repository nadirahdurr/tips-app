import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { Toaster, toast } from "react-hot-toast";
// import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [account, setAccounts] = useState("");
  const [web3Provider, setWeb3Provider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [ethAmount, setEthAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const infuraID = process.env.INFURA_KEY;

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: infuraID,
        rpc: `https://rinkeby.infura.io/v3/${infuraID}`,
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK, // Required
      options: {
        appName: "Nadirah's Tip App", // Required
        infuraId: infuraID, // Required
        chainId: 4, // Optional. It defaults to 1 if not provided
        darkMode: false, // Optional. Use dark theme, defaults to false
      },
    },
  };

  let web3Modal;
  if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
      network: "rinkeby",
      cacheProvider: true,
      providerOptions,
    });
  }

  const successfulConnectedToast = () => {
    toast.success("You are now connected.", {
      position: "top-right",
      style: {
        borderRadius: "12px",
        background: "white",
        color: "black",
      },
    });
  };

  const sucessfulPaymentSentToast = () => {
    toast.success("Your payment was successfully sent to Nadirah's wallet.", {
      position: "top-right",
      style: {
        borderRadius: "12px",
        background: "white",
        color: "black",
      },
    });
  };

  const unableToConnectToast = () => {
    toast.error(
      "You weren't able to connect your wallet at this time. Please try again later.",
      {
        position: "top-right",
        style: {
          borderRadius: "12px",
          background: "white",
          color: "black",
        },
      }
    );
  };

  const unableToSubmitPaymentToast = () => {
    toast.error("Your payment wasn't sent. Please try again later.", {
      position: "top-right",
      style: {
        borderRadius: "12px",
        background: "white",
        color: "black",
      },
    });
  };

  const updateNetworkToast = () => {
    toast.error(
      "Please update your network to the Rinkeby Test Network or your transaction will not be sent.",
      {
        position: "top-right",
        style: {
          borderRadius: "12px",
          background: "white",
          color: "black",
        },
      }
    );
  };

  const connectWallet = async () => {
    try {
      const modalInstance = await web3Modal.connect();

      const web3Provider = new ethers.providers.Web3Provider(modalInstance);
      if (web3Provider) setWeb3Provider(web3Provider);
      console.log("web3Provider", web3Provider);

      const accounts = await web3Provider.listAccounts();
      if (accounts) setAccounts(accounts[0]);
      successfulConnectedToast();

      const network = await web3Provider.getNetwork();
      if (network) {
        setNetwork(network.name);
        setChainId(network.chainId);
      }

      if (network.name !== "rinkeby") {
        updateNetworkToast();
      }
    } catch (err) {
      if (err) {
        unableToConnectToast();
      }
      console.log(err);
    }
  };

  const handleEthAmount = (e) => {
    e.preventDefault();
    setEthAmount(e.target.value);
  };

  const handleMessage = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const sendEther = async () => {
    setLoading(true);
    try {
      const signer = web3Provider.getSigner();
      // await signer.signMessage(message);

      let txn = await signer.sendTransaction({
        to: "0x812d37428Db3d928C197d15d839d6Ba3DFb46E36",
        value: ethers.utils.parseEther(ethAmount),
      });
      let receipt = await txn.wait();
      if (receipt) {
        sucessfulPaymentSentToast();
        setLoading(false);
      }
    } catch (err) {
      if (err) {
        unableToSubmitPaymentToast();
        setLoading(false);
        console.log(err);
      }
    }
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    setAccounts("");
    setWeb3Provider(null);
  };

  useEffect(() => {
    if (web3Provider?.on) {
      const handleAccountsChanged = (accounts) => {
        setAccounts(accounts[0]);
      };

      const handleDisconnect = () => {
        disconnect();
      };

      const handleChainChanged = (_hexChainId) => {
        console.log("_hexChainId", _hexChainId);

        setChainId(_hexChainId);
      };

      web3Provider.on("accountsChanged", handleAccountsChanged);
      web3Provider.on("chainChanged", handleChainChanged);
      web3Provider.on("disconnect", handleDisconnect);

      return () => {
        if (web3Provider.removeListener) {
          web3Provider.on("accountsChanged", handleAccountsChanged);
          web3Provider.on("chainChanged", handleChainChanged);
          web3Provider.on("disconnect", handleDisconnect);
        }
      };
    }
  }, [web3Provider]);

  return (
    <div>
      <>
        <Toaster />
      </>
      <div className="bg-black">
        <Head>
          <title>Nadirah&apos;s Tip dApp</title>
          <meta
            name="description"
            content="Send tips to Nadirah for amazing dev work"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          {account === "" ? (
            <div className="md:bg-white md:py-16 md:px-24 px-8 py-12 md:rounded-full md:shadow-lg md:shadow-pink-400 md:border-pink-400 md:border-4">
              <div className="md:text-5xl text-2xl font-bold pb-8 md:text-black text-white text-center uppercase">
                Nadirah&apos;s Tipping dApp
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => connectWallet()}
                  className="bg-pink-500 hover:bg-pink-300 rounded-full drop-shadow-lg text-black uppercase font-bold md:w-96 w-48 py-4 border-black border-2"
                >
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="justify-items-center text-white uppercase">
                <div className="md:text-8xl text-5xl font-bold pb-8 text-pink-500 text-center">
                  Send a tip 🦄
                </div>
                <div className="flex justify-center text-white text-lg">
                  Connected Account:{" "}
                  {account.substring(0, 6) +
                    "..." +
                    account.substring(account.length - 4)}
                </div>
                <div className="text-center mt-2">
                  Network ID: {chainId ? chainId : "No Network"}
                </div>
              </div>
              <div className="mt-8 flex justify-center  ">
                <div className="md:border-4 md:border-pink-400 md:px-32 py-12  rounded-full md:shadow-lg md:shadow-pink-400 md:bg-white">
                  <div className="flex justify-center mb-8">
                    <div className="flex justify-center text-4xl">
                      <input
                        onChange={(e) => handleEthAmount(e)}
                        type="number"
                        value={ethAmount}
                        className="bg-transparent md:w-48 w-36 outline-0 outline-black border-0 text-center md:text-black text-white font-bold text-4xl "
                        autoComplete="off"
                        maxLength="4"
                      />
                      <div className="md:text-black text-white font-bold md:mr-8">
                        ETH
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 mb-4 flex justify-center">
                    <input
                      onChange={(e) => handleMessage(e)}
                      value={message}
                      className=" border-2 rounded-full md:w-96 w-64 px-8 py-2 border-black drop-shadow-md outline-pink-300 text-2xl"
                      type="text"
                      placeholder="For: Web App, Speaking, etc."
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => sendEther()}
                      className="bg-pink-500 flex justify-center hover:bg-pink-300 rounded-full drop-shadow-lg text-black uppercase text-2xl font-bold md:w-96 w-64 py-4 border-black border-2"
                      type="submit"
                    >
                      {loading ? (
                        <svg
                          role="status"
                          className="w-6 h-6 mr-4 text-gray-300 animate-spin fill-black spin 3s linear infinite"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      ) : (
                        "Pay"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-white text-lg mt-8 text-center ">
                <button className="uppercase" onClick={() => disconnect()}>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
