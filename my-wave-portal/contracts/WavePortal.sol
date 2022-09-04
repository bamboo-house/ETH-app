// WavePortal.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract WavePortal {
  uint256 totalWaves;

  // 乱数生成のための基盤となるシード（種）を作成
  uint256 private seed;

  // NewWaveイベントの作成
  event NewWave(address indexed from, uint256 timestamp, string messaage);

  // Waveという構造体を作成。構造体の中身はカスタマイズできる。
  struct Wave {
    address waver; // 「wave」を送ったユーザーのアドレス
    string message; // ユーザーが送ったメッセージ
    uint256 timestamp; // ユーザーが「wave」を送った瞬間のタイムスタンプ
  }

  // 構造体の配列を格納するための変数wavesを宣言。これで、ユーザーが送ってきた全ての「wave」を保持することができる。
  Wave[] waves;

  // "address => uint mapping"は、アドレスと数値を関連づける
  mapping(address => uint256) public lastWavedAt;

  constructor() payable {
    console.log("We have been constructed!");

    // 初期シードを設定
    seed = (block.timestamp + block.difficulty) % 100;
  }

  // _messageという文字列を要求するようにwave関数を更新。
  // _messageは、ユーザーがフロントエンドから受信するメッセージです。
  function wave(string memory _message) public {
    // 現在のユーザーがwaveを送信している時刻と、前回waveを送信した時刻が15分以上離れていることを確認
    require(
      lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
      "Wait 15m"
    );

    // ユーザーの現在のタイムスタンプを更新する
    lastWavedAt[msg.sender] = block.timestamp;

    totalWaves += 1;
    console.log("%s waved w/ message %s", msg.sender, _message);
    /*
    * 「👋（wave）」とメッセージを配列に格納。
    */
    waves.push(Wave(msg.sender, _message, block.timestamp));

    // ユーザーのために乱数を生成
    seed = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random # generated: %d", seed);

    if (seed <= 50) {
      console.log("%s won!", msg.sender);

      /*
      * 「👋（wave）」を送ってくれたユーザーに0.0001ETHを送る
      */
      uint256 prizeAmount = 0.0001 ether;
      require(
        prizeAmount <= address(this).balance,
        "Trying to withdraw more money than the contract has."
      );
      (bool success, ) = (msg.sender).call{value: prizeAmount}("");
      require(success, "Failed to withdraw money from contract.");
    } else {
      console.log("%s did not win.", msg.sender);
    }
    /*
    * コントラクト側でemitされたイベントに関する通知をフロントエンドで取得できるようにする。
    */
    emit NewWave(msg.sender, block.timestamp, _message);
  }


  // 構造体配列のwavesを返してくれるgetAllWavesという関数を追加。
  // これで、私たちのwebアプリからwavesを取得することができます。
  function getAllWaves() public view returns (Wave[] memory) {
    return waves;
  }

  function getTotalWaves() public view returns (uint256) {
    console.log("We have %d total waves!", totalWaves);
    return totalWaves;
  }
}