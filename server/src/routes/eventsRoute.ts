import express, { Request, Response } from 'express';
import { getTokensToBeClaimed, getTokensToBeReleased, getBridgedTokens, getBridgedTokensByUserAddress } from '../../database/bridgedToken'

const router = express.Router();

router.get('/tokensToBeClaimed', async (req: Request, res: Response) => {
  try {
    const tokensToBeClaimed = await getTokensToBeClaimed();
    res.json(tokensToBeClaimed);
  } catch (error) {
    console.error('Error fetching tokens to be claimed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/tokensToBeReleased', async (req: Request, res: Response) => {
  try {
    const tokensToBeReleased = await getTokensToBeReleased();
    res.json(tokensToBeReleased);
  } catch (error) {
    console.error('Error fetching tokens to be released:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/bridgedTokens', async (req: Request, res: Response) => {
  try {
    const bridgedTokens = await getBridgedTokens();
    res.json(bridgedTokens);
  } catch (error) {
    console.error('Error fetching bridged ERC-20 tokens:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/bridgedTokensByUserAddress/:userAddress', async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.userAddress;
    const bridgedTokensByUserAddress = await getBridgedTokensByUserAddress(userAddress);
    res.json(bridgedTokensByUserAddress);
  } catch (error) {
    console.error('Error fetching bridged tokens by user address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;