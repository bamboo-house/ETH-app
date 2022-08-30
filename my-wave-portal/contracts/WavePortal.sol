// WavePortal.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

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

    constructor() {
      console.log("WavePortal - Smart Contract!");
    }


    // _messageという文字列を要求するようにwave関数を更新。
    // _messageは、ユーザーがフロントエンドから受信するメッセージです。
    function wave(string memory _message) public {
      totalWaves += 1;
      console.log("%s waved w/ message %s", msg.sender, _message);

      // 「wave」とメッセージを配列に格納。
      waves.push(Wave(msg.sender, _message, block.timestamp));

      // コントラクト側でemitされたイベントに関する通知をフロントエンドで取得できるようにする。
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