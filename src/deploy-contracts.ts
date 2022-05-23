import { originateContracts } from './contract-helpers';

const main = async () => {
  const deployedContracts = await originateContracts();
  console.log(deployedContracts);
};

main();
