<div id="top"></div>


<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">Oracle Testing Framework</h3>

  <p align="center">
    project_description
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This is a mostly automatic framework that evaluates the cost of adding data to the storage of oracle smart contracts for one sensor. It records the gas fee, storage cost, timestamp and total cost. Final output is a csv file per smart contract which can then be graphed.

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [Node.js](https://nodejs.org/en/)
* [Typescript](https://www.typescriptlang.org/)
* [Taquito](https://tezostaquito.io/)
* [Flextesa](https://tezos.gitlab.io/flextesa/)
* [Docker](https://www.docker.com/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started


### Prerequisites

Get a Flextesa setup and running
* ```sh
  docker run --rm --name objkt-sandbox --detach -p 20000:20000 -e block_time=3 oxheadalpha/flextesa:latest hangzbox start
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/somaticbits/oracleTestingFramework.git
   ```
2. Install NPM packages
   ```sh
   npm ci
   ```
3. Transpile TypeScript into JavaScript with
    ```sh
    npm run build
    ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

The usage is pretty simple: run ```npm start``` and it will automatically deploy the contracts on the sandbox, and will add data automatically for 2880 steps (which corresponds to a 24 hour day on testnet or mainnet). This runs for around 3hours per contract. The results will be found in the ```results``` folder.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Your Name - [@somaticbits](https://twitter.com/somaticbits) - david@somaticbits.com

Project Link: [https://github.com/somaticbits/oracleTestingFramework](https://github.com/somaticbits/oracleTestingFramework)

<p align="right">(<a href="#top">back to top</a>)</p>
