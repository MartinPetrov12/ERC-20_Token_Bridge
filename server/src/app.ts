import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors'; 
import mongoose from 'mongoose';
import eventsRoute from './routes/eventRouter';  
import { getContract, getLastProcessedBlock, getProvider, updateLastProcessedBlock } from './utils';
import { parseEvent } from './services/EventService';

const LAST_PROCESSED_BLOCK_MUMBAI_PATH = "./LastProcessedMumbaiBlock.txt";
const LAST_PROCESSED_BLOCK_SEPOLIA_PATH = "./LastProcessedSepoliaBlock.txt";

const app = express();
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use('/api', eventsRoute);

const server = http.createServer(app);

server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/")
})

async function run() {
  await connectToDatabase();

  let isMumbaiFetchingLocked = false;
  let isSepoliaFetchingLocked = false;

  let lastProcessedMumbaiBlock = getLastProcessedBlock(LAST_PROCESSED_BLOCK_MUMBAI_PATH);
  let lastProcessedSepoliaBlock = getLastProcessedBlock(LAST_PROCESSED_BLOCK_SEPOLIA_PATH); 
  
  const sepoliaBridgeContract = await getContract('sepolia')
  const mumbaiBridgeContract = await getContract('maticmum');

  const sepoliaProvider = await getProvider('sepolia');
  const mumbaiProvider = await getProvider('maticmum');

  sepoliaProvider.on('block', async (blockNumber: number) => {
    if(!isSepoliaFetchingLocked) {
      isSepoliaFetchingLocked = true;
      const events = await sepoliaBridgeContract.queryFilter('*', lastProcessedSepoliaBlock, blockNumber);
      lastProcessedSepoliaBlock = blockNumber + 1;
      events.forEach(async event => {
        console.log(event);
        await parseEvent(event, 'sepolia');
      });
      await updateLastProcessedBlock(LAST_PROCESSED_BLOCK_SEPOLIA_PATH, lastProcessedSepoliaBlock);
      isSepoliaFetchingLocked = false;
    }
  });

  mumbaiProvider.on('block', async (blockNumber: number) => {
    if(!isMumbaiFetchingLocked) {
      isMumbaiFetchingLocked = true;
      const events = await mumbaiBridgeContract.queryFilter('*', lastProcessedMumbaiBlock, blockNumber);
      lastProcessedMumbaiBlock = blockNumber + 1;
      events.forEach(async event => {
        console.log(event);
        await parseEvent(event, 'maticmum');
      });
      await updateLastProcessedBlock(LAST_PROCESSED_BLOCK_MUMBAI_PATH, lastProcessedMumbaiBlock);
      isMumbaiFetchingLocked = false;
    }
  });
}

async function connectToDatabase() {
  const MONGO_URL = process.env.MONGO_URL;
  mongoose.Promise = Promise;
  await mongoose.connect(MONGO_URL);
  mongoose.connection.on('error', (error: Error) => console.log("Error while connecting to the database: " + error));
}

run().catch((error) => {
  console.error('Error scanning blocks:', error);
});
