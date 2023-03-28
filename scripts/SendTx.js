const { utils, EIP712Signer } = require("zksync-web3");
const { ethers } = require("ethers");

async function sendTx(provider, account, user, tx) {
  tx = {
    ...tx,
    from: account.address,
    chainId: (await provider.getNetwork()).chainId,
    nonce: await provider.getTransactionCount(account.address),
    type: 113,
    customData: {
      ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
    },
  };

  tx.gasPrice = await provider.getGasPrice();
  if (tx.gasLimit == undefined) {
    tx.gasLimit = await provider.estimateGas(tx);
  }

  const signedTxHash = EIP712Signer.getSignedDigest(tx);
  const signature = ethers.utils.arrayify(
    ethers.utils.joinSignature(user._signingKey().signDigest(signedTxHash))
  );

  tx.customData = {
    ...tx.customData,
    customSignature: signature,
  };

  return await provider.sendTransaction(utils.serialize(tx));
}

module.exports = { sendTx };
