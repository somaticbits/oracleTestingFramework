import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { stringify } from 'csv-stringify';

import fs from 'node:fs';
import path from 'node:path';

import { getCosts, originateContracts } from './contract-helpers';

import { skFlextesaAlice, intervalTime, intervalSteps } from './config';

type Fees = {
  timestamp: number;
  data: number;
  consumedGas: number;
  storageFee: number;
  total: number;
};

const addData = (signer: TezosToolkit, contractAddress: string): Promise<Fees[]> => {
  return new Promise((resolve) => {
    const costs: Fees[] = [];
    let counter = 0;
    const interval = setInterval(async () => {
      const data = Math.round(Math.random() * 100);
      costs.push(await getCosts(signer, contractAddress, data));
      console.log(`${counter} - ${data}`);
      counter += 1;
      if (counter === intervalSteps) {
        clearInterval(interval);
        resolve(costs);
      }
    }, intervalTime);
  });
};

const writeCSV = (data: Fees[], time: number, steps: number, contractType: string) => {
  const date = new Date();
  const stream = fs.createWriteStream(
    path.join(
      __dirname,
      'results',
      `${date.getFullYear()}${date.getMonth()}${date.getDay()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}-${time}-${steps}-${contractType}.csv`,
    ),
  );
  const stringifier = stringify({ header: true });
  for (const fee of data) {
    stringifier.write(fee);
  }
  stringifier.pipe(stream);
};

const main = async () => {
  const Tezos = new TezosToolkit('http://localhost:20000');
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(skFlextesaAlice),
  });

  const contracts: { recordBigmapContract: string; bigmapContract: string; mapContract: string } =
    await originateContracts();

  for await (const [contractType, contractAddress] of Object.entries(contracts)) {
    console.log(`Getting fees for ${contractType} - ${contractAddress}`);
    const data: Fees[] = await addData(Tezos, contractAddress);
    writeCSV(data, intervalTime, intervalSteps, contractType);
  }
};

main()
  .then(() => {
    return 1;
    console.log('Done');
  })
  .catch((error) => {
    console.log(error);
  });
