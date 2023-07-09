# ERC-20_Token_Bridge
### Hello! I am glad you are taking a look at my project. In this repository you can find an implementation of an ERC-20 token bridge. It currently supports the Sepolia and Mumbai networks, feel free to try it out!

The repository is consisting of two parts:
- bridge - that includes all smart contracts and most of the interactions with them. There are also tests and deployment scripts.
- server - that includes a mongodb database, indexer of the blockchain and an API which currently works only on the localhost. There is a deployed version, it is on https://erc-20-bridge-lime-final.onrender.com/, however I experienced issues with the database and it can not be used at the moment (possible future improvement)


# Steps to take when using it.
1. Add your private keys for Sepolia and Mumbai testnets in the .env.dev files in both /bridge and /server. Make sure to have some test tokens on you. If you happen to be broke, you can get some for free at:
https://mumbaifaucet.com/,
https://sepoliafaucet.com/

2. Proceed with deploying two bridge contracts, one on mumbai and one on sepolia. Then the fun begins :)
```
npx hardhat deploy-bridge --network sepolia
npx hardhat deploy-bridge --network maticmum
```

 You are free to do whatever you please. You could choose from the tasks in the hardhat.config.ts. If you do not understand any of them, you can write the following: 
 ```
 npx hardhat help <task>
 ```
 , where task is the task you want more information of. If it has any parameters, you will get more description about them and about the task itself.

 3. If you want to verify anything, you could use the scanners provided by etherscan and polygon:
 - https://etherscan.io/
 - https://mumbai.polygonscan.com/



Please do not hesitate to ask me if you have any questions. I really enjoyed working on that project and would be happy to talk about it with anyone!