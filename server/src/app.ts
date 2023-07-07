import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors'; 
import mongoose from 'mongoose';
// import ethers from 'ethers';
import { Contract, Event, ethers } from 'ethers';
import { addTokensToClaim, addTokensToRelease } from '../../bridge/scripts/mappingsSetter'
import BridgeArtifact from '../../bridge/artifacts/contracts/Bridge.sol/Bridge.json';
import fs from 'fs';

const app = express();

app.use(cors({
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/")
})

const MONGO_URL = 'mongodb+srv://martinantonov345:XHZnqVTyZFbzYEse@clusterbatko.vutrp6j.mongodb.net/?retryWrites=true&w=majority'

// mongoose.Promise = Promise;
// mongoose.connect(MONGO_URL);

// mongoose.connection.on('error', (error: Error) => console.log(error));

const mumbaiAlchemyAPI = 'd0ugQFxtA7g6jQNT6x988E4_FsfSC23c';
const sepoliaInfuraAPI = '34e4a0562c904be6bb4b9d3a72694d7c';

const sepoliaProvider = new ethers.providers.InfuraProvider('sepolia', sepoliaInfuraAPI);
const mumbaiProvider = new ethers.providers.AlchemyProvider('maticmum', mumbaiAlchemyAPI);

const sepoliaBridgeAddress = '0xB372F4943dEFF344f263E1127C78360f6AD59dfd';
const mumbaiBridgeAddress = '0xf09C04D6849C2b9c171ea810DE320F3Ffcc1945a';


const lastProcessedMumbaiBlockFilePath = "../LastProcessedMumbaiBlock.txt";
const lastProcessedSepoliaBlockFilePath = "../LastProcessedSepoliaBlock.txt";

async function scanBlocks() {
  let isMumbaiFetchingLocked = false;
  let isSepoliaFetchingLocked = false;
  let lastProcessedMumbaiBlock = getLastProcessedBlock(lastProcessedMumbaiBlockFilePath);
  let lastProcessedSepoliaBlock = getLastProcessedBlock(lastProcessedSepoliaBlockFilePath); 
  
  const sepoliaBridgeContract = new Contract(sepoliaBridgeAddress, BridgeArtifact.abi, sepoliaProvider);
  const mumbaiBridgeContract = new Contract(mumbaiBridgeAddress, BridgeArtifact.abi, mumbaiProvider);

  sepoliaProvider.on('block', async (blockNumber: number) => {
    if(!isSepoliaFetchingLocked) {
      isSepoliaFetchingLocked = true;
      const events = await sepoliaBridgeContract.queryFilter('*', lastProcessedSepoliaBlock, blockNumber);
      lastProcessedSepoliaBlock = blockNumber + 1;
      events.forEach(async event => {
        await parseEvent(event, 'sepolia', mumbaiBridgeAddress);
      });
      await updateLastProcessedBlock(lastProcessedSepoliaBlockFilePath, lastProcessedSepoliaBlock);
      isSepoliaFetchingLocked = false;
    }
  });

  mumbaiProvider.on('block', async (blockNumber: number) => {
    if(!isMumbaiFetchingLocked) {
      isMumbaiFetchingLocked = true;
      const events = await mumbaiBridgeContract.queryFilter('*', lastProcessedMumbaiBlock, blockNumber);
      lastProcessedMumbaiBlock = blockNumber + 1;
      events.forEach(async event => {
        await parseEvent(event, 'maticmum', mumbaiBridgeAddress);
      });
      
      await updateLastProcessedBlock(lastProcessedMumbaiBlockFilePath, lastProcessedMumbaiBlock);

      isMumbaiFetchingLocked = false;
    }
  });
}

scanBlocks().catch((error) => {
  console.error('Error scanning blocks:', error);
});

async function parseEvent(event: Event, network: string, bridgeAddress: string) {
  if(event.event == "TokenLocked") {
    await processLockEvent(event, network, bridgeAddress);
  } else if(event.event == "TokenClaimed") {
    await processClaimEvent(event, network, bridgeAddress);
  } else if(event.event == "TokenReleased") {
    await processReleaseEvent(event, network, bridgeAddress);
  } else if(event.event == "TokenBurned") {
    await processBurnEvent(event, network, bridgeAddress);
  } else if(event.event == "WrappedTokenAdded") {
    await processWrappedTokenEvent(event, network);
  }
}

async function processLockEvent(event: Event, network: string, bridgeAddress: string) {
  console.log("Locked funds");
  
  const tokenAddress = event.args[0];
  const userAddress = event.args[1]
  const amount = event.args[2];
  if(network == "sepolia") {
    await addTokensToClaim("maticmum", mumbaiBridgeAddress, tokenAddress, userAddress, amount);
  } else if(network == "maticmum") {
    await addTokensToClaim("sepolia", sepoliaBridgeAddress, tokenAddress, userAddress, amount);
  }
  // TO-DO: save event in db
}

function processClaimEvent(event: Event, network: string, bridgeAddress: string) {
    console.log("User: " + event.args[1] + " claimed " + event.args[2] + " tokens, address of token: " + event.args[0])
    // save event in database
}

function processReleaseEvent(event: Event, network: string, bridgeAddress: string) {
  throw new Error('Function not implemented.');
  // save event in database
  console.log("Released tokens");
}

async function processBurnEvent(event: Event, network: string, bridgeAddress: string) {
  console.log("Burned tokens");

  const tokenAddress = event.args[0];
  const userAddress = event.args[1]
  const amount = event.args[2];
  
  if(network == "sepolia") {
    await addTokensToRelease("maticmum", mumbaiBridgeAddress, tokenAddress, userAddress, amount);
  } else if(network == "maticmum") {
    await addTokensToRelease("sepolia", sepoliaBridgeAddress, tokenAddress, userAddress, amount);
  }

  //TO-DO: Save event in db
}

function processWrappedTokenEvent(event: Event, network: string) {
  console.log("New wrapped contract added: " + event.args[0]);
}

function getLastProcessedBlock(filePath: string): number {
  if (fs.existsSync(filePath)) {
    const lastProcessedMumbaiBlock = parseInt(fs.readFileSync(filePath).toString());
    return lastProcessedMumbaiBlock;
  } else return 0;
}

async function updateLastProcessedBlock(filePath: string, lastProcessedBlock: number) {
  fs.writeFile(filePath, lastProcessedBlock.toString(), (err) => {
    
  });
  // console.log("Finished updating");
}


