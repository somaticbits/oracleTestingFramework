// import { Gpio } from 'pigpio';

import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { stringify } from 'csv-stringify';

import fs from 'node:fs';
import path from 'node:path';

import { getCosts, originateContracts } from './contract-helpers';

import { skFlextesaAlice, intervalTime, intervalSteps } from './config';

// const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
// const echo = new Gpio(24, { mode: Gpio.INPUT, alert: true });

type Fees = {
  consumedGas: number;
  storageFee: number;
  total: number;
};

const isRaspberry = false;

// trigger.digitalWrite(0);

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

  if (isRaspberry) {
    console.log('Raspberry');
  } else {
    for await (const [contractType, contractAddress] of Object.entries(contracts)) {
      console.log(`Getting fees for ${contractType} - ${contractAddress}`);
      const data: Fees[] = await addData(Tezos, contractAddress);
      writeCSV(data, intervalTime, intervalSteps, contractType);
    }
  }

  // let startTick: number;
  //
  // console.log('Watching for ultrasonic distance...');
  //
  // echo.on('alert', (level: number, tick: number) => {
  //   if (level === 1) {
  //     startTick = tick;
  //   } else {
  //     const diff = Math.trunc(tick) - Math.trunc(startTick);
  //     const distance = (diff / 2) * 1e6;
  //     console.log(`Distance: ${distance}`);
  //     Tezos.contract
  //       .at('KT1JWKZTrc3EtrGewQ6fGDMtAV6myXFNZUwi')
  //       .then((contract) => contract.methods.add_data(distance, 0).send())
  //       .then((op) => {
  //         return op
  //           .confirmation(2)
  //           .then(() => console.log(`Fees for the operation: ${(op.fee + Number.parseFloat(op.consumedGas)) / 1e6}`));
  //       })
  //       .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  //   }
  // });
  //
  // // Trigger a distance measurement once per second
  // setInterval(() => {
  //   trigger.trigger(10, 1); // Set trigger high for 10 microseconds
  // }, 6000);



};

// const allSensorsOff = () => {
//   trigger.digitalWrite(1);
//   console.log('All sensors off');
// };
//
// process.on('SIGINT', () => {
//   allSensorsOff();
//   process.exit();
// });

main()
  .then(() => {
    return 1;
    console.log('Done');
  })
  .catch((error) => {
    console.log(error);
    // allSensorsOff();
  });
