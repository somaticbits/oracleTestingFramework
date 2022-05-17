import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import fs from 'node:fs';

import { skFlextesaAlice } from './config';

const delay = (ms: number) => {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const originateContract = async (signer: TezosToolkit, contract: string, storage: string) => {
  await signer.contract
    .originate({
      code: contract,
      init: storage,
    })
    .then((op) => {
      return op.contractAddress;
      console.log(`Waiting for confirmation of origination for ${op.contractAddress}`);
    })
    .catch((error) => console.error(`${JSON.stringify(error)}`));
};

export const originateContracts = async () => {
  const Tezos = new TezosToolkit('http://localhost:20000');
  Tezos.setProvider({ signer: new InMemorySigner(skFlextesaAlice) });

  const oBigmap = fs.readFileSync(`${__dirname}/contracts/oracle_bigmap/main.tz`, 'utf8');
  const oBigmapStorage = fs.readFileSync(`${__dirname}/contracts/oracle_bigmap/main_storage.tz`, 'utf8');
  const bigmapContract = await originateContract(Tezos, oBigmap, oBigmapStorage).then(() =>
    console.log(`Bigmap contract originated`),
  );
  await delay(5000);

  const oMap = fs.readFileSync(`${__dirname}/contracts/oracle_map/main.tz`, 'utf8');
  const oMapStorage = fs.readFileSync(`${__dirname}/contracts/oracle_map/main_storage.tz`, 'utf8');
  const mapContract = await originateContract(Tezos, oMap, oMapStorage).then(() =>
    console.log(`Map contract originated`),
  );
  await delay(5000);

  const oRecordBigmap = fs.readFileSync(`${__dirname}/contracts/oracle_record_bigmap/main.tz`, 'utf8');
  const oRecordBigmapStorage = fs.readFileSync(`${__dirname}/contracts/oracle_record_bigmap/main_storage.tz`, 'utf8');
  const recordBigmapContract = await originateContract(Tezos, oRecordBigmap, oRecordBigmapStorage).then(() =>
    console.log(`Record bigmap contract originated`),
  );
  await delay(5000);

  return { bigmapContract, mapContract, recordBigmapContract };
};
