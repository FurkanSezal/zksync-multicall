import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { useMoralis, useWeb3Contract } from "react-moralis";
import React, { useEffect, useState } from "react";
import { Button } from "@web3uikit/core";
import { VaultAbi } from "../constants/abis/VaultAbi";
import { PoolAbi } from "../constants/abis//PoolAbi";
import { RouterAbi } from "../constants/abis/RouterAbi";
import { factoryAbi } from "../constants/abis/PoolFactory";
import { testAbi } from "../constants/abis/testAbi";
import { wethAbi } from "@/constants/abis/WethAbi";
import { AAFactoryAbi } from "../constants/abis/AAFactoryAbi";
import { ethers } from "ethers";
import { sendTx } from "@/scripts/SendTx";
import { EIP712Signer, types, utils, Wallet } from "zksync-web3";
import { AccountAbi } from "@/constants/abis/AccountAbi";
import { erc20abi } from "../constants/abis/erc20abi";

export default function Home() {
  const { chainId, account, isWeb3Enabled, web3 } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";

  const USDC_ADDRESS = "0x0faF6df7054946141266420b43783387A78d82A9";
  const LENDING_ADDRESS = "0xA7c9A38e77290420eD06cf54d27640dE27399eB1";
  const WETH_ADDRESS = "0x20b28B1e4665FFf290650586ad76E977EAb90c5D";
  const DAI_ADDRESS = "0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b";
  const DAI_DECIMALS = 18;
  const POOL_ADDRESS = "0xe52940eDDa6ec5FDabef7C33B9C1E1d613BbA144"; // ETH/DAI
  const VAULT_CONTRACT_ADDRESS = "0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8";
  const ROUTER_ADDRESS = "0xB3b7fCbb8Db37bC6f572634299A58f51622A847e";
  const POOLFACTORY_ADDRESS = "0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006"; // Classic
  const ADDRESS_ZERO = ethers.constants.AddressZero;
  const value = ethers.utils.parseEther("0.000001");

  const AA_FACTORY_ADDRESS = "0xEb6D0610064b49d5868703892C3cf5A5AF10544E";
  const AA_ABI = AAFactoryAbi;

  const { runContractFunction } = useWeb3Contract();

  async function handleClick() {
    const signer = web3.getSigner();
    const Router = new ethers.Contract(ROUTER_ADDRESS, RouterAbi, signer);
    const WETH = new ethers.Contract(WETH_ADDRESS, wethAbi, signer);
    const DAI = new ethers.Contract(DAI_ADDRESS, erc20abi, signer);
    //  console.log(await signer.getAddress());

    const value = ethers.utils.parseEther("0.01");

    const MAX_APPROVE =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    const salt = ethers.constants.HashZero;
    const aaFactory = new ethers.Contract(AA_FACTORY_ADDRESS, AA_ABI, signer);
    const owner = await signer.getAddress();
    //console.log("owner", owner);
    const abiCoder = new ethers.utils.AbiCoder();
    const accountAddress = utils.create2Address(
      salt,
      await aaFactory.aaBytecodeHash(),
      abiCoder.encode(["address"], [owner]),
      AA_FACTORY_ADDRESS
    );
    let aa_address = accountAddress;
    // console.log(aa_address);
    //0x3861BeF4B47Bc967aD708A5E7cA36B499D422672

    console.log(aa_address, "and", signer);

    const usdcAmount = ethers.utils.parseUnits("100", 6);

    const USDC = new ethers.Contract(USDC_ADDRESS, erc20abi, signer);

    let tx0 = await USDC.populateTransaction.approve(
      LENDING_ADDRESS,
      MAX_APPROVE,
      { value: ethers.utils.parseEther("0") }
    );
    tx0 = {
      ...tx0,
      from: aa_address,
      to: USDC_ADDRESS,
      chainId: 280,
      nonce: await web3.getTransactionCount(aa_address),
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      },
      value: ethers.utils.parseEther("0"),
      data: USDC.interface.encodeFunctionData("approve", [
        LENDING_ADDRESS,
        MAX_APPROVE,
      ]),
    };

    tx0.gasPrice = await web3.getGasPrice();
    tx0.gasLimit = await web3.estimateGas(tx0);

    console.log("TX 0 is caltulating");
    console.log(tx0);

    const signedTxHash0 = EIP712Signer.getSignedDigest(tx0);
    const signature0 = ethers.utils.arrayify(
      ethers.utils.joinSignature(signer._signingKey().signDigest(signedTxHash0))
    );

    console.log("TX 0 CALCULATEFD!");
    tx0.customData = {
      ...tx0.customData,
      customSignature: signature0,
    };

    async function checkBalances() {
      const WethBalance = await web3.getBalance(account);
      const WethBalanceNumber = Number(
        ethers.utils.formatUnits(WethBalance, DAI_DECIMALS)
      );

      const DaiBalance = await DAI.balanceOf(account);
      const DaiBalanceNumber = Number(
        ethers.utils.formatUnits(DaiBalance, DAI_DECIMALS)
      );

      console.log("DAIBalance: ", DaiBalanceNumber);
      console.log("WETHBalance: ", WethBalanceNumber);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>foodTrusty</title>
        <meta name="description" content="foodTrusty" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Button text="Button" onClick={handleClick}></Button>
    </div>
  );
}
