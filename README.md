# Blockchain-based crowdfunding platform
Live demo at: http://akiz.ga:3000
## System architecture
System include services: 
- **client** (front-end). In folder ``dapp`` (include smart contract solidity and reactjs source)
- **server** (API to store some centralized data and DB server). In folder ``server``


## Build with Docker (Recommended)
We also provide ``Dockerfile`` in each folders (dapp, server) to build image for install environment and run app. Of course, you need install Docker engine.
### 1. Edit some env variable to run correctly
First, in file ``dapp/.env``:
- ``MNENOMIC`` is mnenomic of your account to deploy contract and sign transaction.
- ``INFURA_API_KEY`` is api key on infura.io, you can register an account and get infura key. Why need infura? --> In this project, i choose infura to sync states on blockchain.

And in file ``dapp/client/.env``:
- ``REACT_APP_SVR_POST`` is uri for upload data of campaign. Format: ``http://[IP|DOMAIN]:PORT/api/set``
- ``REACT_APP_SVR_GET`` is uri for get data of campaign. Format: ``http://[IP|DOMAIN]:PORT/api/get/REF_CAMPAIGN``
- ``REACT_APP_DEFAULT_NETWORK`` is api for connect to node on blockchain to fetch data in Homepage.Default, we set to *https://ropsten.infura.io/v3/PROJECT_ID*
- ``REACT_APP_DEFAULT_ACCOUNT`` is address of your account for fetch data from blockchain.
- ``RECAPTCHA_ENABLE`` include value **1** (use captcha) or **0** (NOT use captcha). We set default to **0**
- ``REACT_APP_RECAPTCHA_SITEKEY`` is **site key** in captcha module. We use **Google ReCaptcha**, to use this components, you have to register an account and add your site, then get your key. If you set RECAPTCHA_ENABLE is **0**, you can skip this step. (Default we disable this module)

Finally, in ``server/.env``:
- ``PORT_LISTEN`` is port that you will start server to listen requests. I set default with **8080**
- ``RECAPTCHA_ENABLE`` include value **1** (use captcha) or **0** (NOT use captcha). We set default to **0**
- ``RECAPTCHA_SECRET_KEY`` if you set RECAPTCHA_ENABLE is 1, you have to have an account on Google Recaptcha and get a secret key for use this component. If set to 0, you can skip this step.
- ``REDIS_HOST``, ``REDIS_PORT``, ``REDIS_PASSWORD`` is information to connect to Redis server. (Note: if you change redis password, you have to edit in file ``docker-compose.yml`` to run correctly)

### 2. Build and run
In repository root folder, you can run cmd:

```bash
docker-compose up
```

After run above cmd, docker will build and run some images. It will start 3 container with 3 services:
- **dapp-client** with port 3000 (development port of ReactJS).
- **dapp-api-server** with port 8080.
- **redis** with port 6379.

Or you can use some instance images that we have built and push into Docker hub. You can run:

```bash
docker-compose -f docker-compose-instance.yml up
```

## Manual install
See detail at file ``manual_install.md`` in folders: ``dapp``, ``client``. (If you choose Docker to build and run, you can skip this section)
## How to use?
To use this dApp, use must have an extension called `Metamask`, this is web browser extension, you can install it on Firefox, Chrome, Opera, Vivaldi,...

After, you access to http://IP_SERVER:3000
