import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
// ABIファイルをインポート（コントラクトの取説）
import abi from "./utils/WavePortal.json";

const App = () => {
  // ユーザーのパブリックウォレットを保存するために使用する状態変数を定義する
  const [currentAccount, setCurrentAccount] = useState("");
  // デプロイされたコントラクトのアドレスを保持する変数を作成
  const contractAddress = "0x2729499Fa35Df456367e28B40437346259B4867B";
  // ABIの内容を参照する変数を作成
  const contractABI = abi.abi;
  // 全てのwavesを保存する状態変数を定義
  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () => {
    const {ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const siger = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          siger
        );

        // コントラクトからgetAllWavesメソッドを呼び出す
        const waves = await wavePortalContract.getAllWaves();
        // UIに必要なのは、アドレス、タイムスタンプ、メッセージだけなので、以下のように設定
        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
        
        // React Stateにデータを格納する
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // emitされたイベントに反応する
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    // NewWaveイベントがコントラクトから発信されたときに、情報を受け取る
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      // コンポーネント（情報）がマウント（フロントエンドに反映）される
      wavePortalContract.on("NewWave", onNewWave);
    }

    // メモリリークを防ぐために、NewWaveのイベントを解除する
    return () => {
      if(wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);


  // window.ethereumにアクセスできることを確認する
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // ユーザーのウォレットへのアクセスが許可されているかどうかを確認する
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Fount an authorized account: ", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // connectWalletメソッドを実装
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }; 

  // waveの回数をカウントする関数を実装する
  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // コントラクトにwaveを書き込む
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Webページがロードされた時に下記の関数を実行する
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          (wave)」を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>

        {/* waveボタンにwave関数を連動させる。 */}
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/* ウォレットコネクトのボタン */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}
      </div>
    </div>
  );
};

export default App;