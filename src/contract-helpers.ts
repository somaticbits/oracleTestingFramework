import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import fs from 'node:fs';
import path from 'node:path';

import { skFlextesaAlice } from './config';

const delay = (ms: number) => {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const readTzFile = (contractType: string) => {
  const contract = fs.readFileSync(
    path.join(`${__dirname}`, 'contracts', `${contractType}`, 'contracts', 'main.tz'),
    'utf8',
  );
  const storage = fs.readFileSync(
    path.join(`${__dirname}`, 'contracts', `${contractType}`, 'contracts', 'main_storage.tz'),
    'utf8',
  );

  return { contract, storage };
};

const originateContract = async (signer: TezosToolkit, contract: string | object[], storage: string | object[]) => {
  let address = null;
  await signer.contract
    .originate({
      code: contract,
      init: storage,
    })
    // eslint-disable-next-line promise/always-return
    .then((op) => {
      console.log(`Waiting for confirmation of origination for ${op.contractAddress}`);
      address = op.contractAddress;
    })
    .then(() => console.log(`Contract originated`))
    .then(() => delay(5000))
    .catch((error) => console.error(`${JSON.stringify(error)}`));
  return address;
};

export const originateContracts = async () => {
  const Tezos = new TezosToolkit('http://localhost:20000');
  Tezos.setProvider({ signer: new InMemorySigner(skFlextesaAlice) });

  const { contract: oBigmap, storage: oBigmapStorage } = readTzFile('oracle_bigmap');
  const bigmapContract = await originateContract(Tezos, oBigmap, oBigmapStorage);

  const { contract: oMap, storage: oMapStorage } = readTzFile('oracle_map');
  const mapContract = await originateContract(Tezos, oMap, oMapStorage);

  const { contract: oRecordBigmap, storage: oRecordBigmapStorage } = readTzFile('oracle_map');
  const recordBigmapContract = await originateContract(Tezos, oRecordBigmap, oRecordBigmapStorage);

  return { bigmapContract, mapContract, recordBigmapContract };
};

export const getCosts = (signer: TezosToolkit, contractAddress: string, data: number) => {
  let consumedGas = 0;
  let storageFee = 0;

  signer.contract
    .at(`${contractAddress}`)
    .then((contract) => contract.methods.add_data(data, 0).send())
    .then((op) => {
      consumedGas = Number.parseFloat(op.consumedGas);
      storageFee = op.fee;
    })
    .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  return { consumedGas, storageFee };
};
