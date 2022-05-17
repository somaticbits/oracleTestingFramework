import { Gpio } from 'pigpio';

import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';

import fs from 'node:fs';

import { originateContracts } from './contract-helpers';

import { skFlextesaAlice } from './config';

const MICROSECONDS_PER_CM = 1e6 / 34_321;

const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
const echo = new Gpio(24, { mode: Gpio.INPUT, alert: true });

trigger.digitalWrite(0);

const main = async () => {
  const Tezos = new TezosToolkit('http://localhost:20000');
  Tezos.setProvider({
    signer: await InMemorySigner.fromSecretKey(skFlextesaAlice),
  });

  let startTick: number;

  console.log('Watching for ultrasonic distance...');

  echo.on('alert', (level: number, tick: number) => {
    if (level === 1) {
      startTick = tick;
    } else {
      const diff = Math.trunc(tick) - Math.trunc(startTick);
      const distance = (diff / 2) * 1e6;
      console.log(`Distance: ${distance}`);
      Tezos.contract
        .at('KT1JWKZTrc3EtrGewQ6fGDMtAV6myXFNZUwi')
        .then((contract) => contract.methods.add_data(distance, 0).send())
        .then((op) => {
          return op
            .confirmation(2)
            .then(() => console.log(`Fees for the operation: ${(op.fee + Number.parseFloat(op.consumedGas)) / 1e6}`));
        })
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
    }
  });

  // Trigger a distance measurement once per second
  setInterval(() => {
    trigger.trigger(10, 1); // Set trigger high for 10 microseconds
  }, 6000);
};

const allSensorsOff = () => {
  trigger.digitalWrite(1);
  console.log('All sensors off');
};

process.on('SIGINT', () => {
  allSensorsOff();
  process.exit();
});

main()
  .then(() => {
    return 1;
    console.log('Done');
  })
  .catch((error) => {
    console.log(error);
    allSensorsOff();
  });
