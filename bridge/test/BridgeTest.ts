import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Bridge", () => {
    async function deployBridgeAndGenericToken() {
        const [bridgeOwner, tokenOwner, otherAccount] = await ethers.getSigners();

        const BridgeFactory = await ethers.getContractFactory("Bridge", bridgeOwner);
        const bridge = await BridgeFactory.deploy();

        const TokenFactory = await ethers.getContractFactory("GenericToken", tokenOwner);
        const genericToken = await TokenFactory.deploy("TestToken", "TT");

        return { bridge, genericToken, bridgeOwner, tokenOwner, otherAccount };
    }

    describe("Deployment", async function () {
    
        it("Should set the right owner", async function () {
            const { bridge, genericToken, bridgeOwner } = await loadFixture(deployBridgeAndGenericToken);
    
            expect(await bridge.owner()).to.equal(bridgeOwner.address);
            
        });
    
    });

    describe("External functions", async function () {
        it("Should set a value in the release mapping", async function () {
            const { bridge, genericToken, bridgeOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const amountOfTokens = 10;
            // check value before and after
            const tokensToReleaseBeforeExecution = await bridge.getTokensToRelease(otherAccount.address, genericToken.address);
            await bridge.connect(bridgeOwner).addTokensToRelease(otherAccount.address, genericToken.address, amountOfTokens);
            const tokensToReleaseAfterExecution = await bridge.getTokensToRelease(otherAccount.address, genericToken.address);
            expect(tokensToReleaseBeforeExecution.add(amountOfTokens)).to.equal(tokensToReleaseAfterExecution);
        });

        it("Should set a value in the claim mapping", async function () {
            const { bridge, genericToken, bridgeOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const amountOfTokens = 10;
            
            const tokensToClaimBeforeExecution = await bridge.getTokensToClaim(otherAccount.address, genericToken.address);
            await bridge.connect(bridgeOwner).addTokensToClaim(otherAccount.address, genericToken.address, amountOfTokens);
            const tokensToClaimAfterExecution = await bridge.getTokensToClaim(otherAccount.address, genericToken.address);
            expect(tokensToClaimBeforeExecution.add(amountOfTokens)).to.equal(tokensToClaimAfterExecution);
        });

        it("Should revert on non-owner setting the release mapping", async function () {
            const { bridge, genericToken, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const amountOfTokens = 10;

            await expect(bridge.connect(otherAccount).addTokensToRelease(otherAccount.address, genericToken.address, amountOfTokens))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should revert on non-owner setting the claim mapping", async function () {
            const { bridge, genericToken, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const amountOfTokens = 10;

            await expect(bridge.connect(otherAccount).addTokensToClaim(otherAccount.address, genericToken.address, amountOfTokens))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("Bridge", async function () {
        it("Should lock tokens", async function () {
            const tokensToLock = 10;
            const { bridge, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToLock);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToLock);

            await expect(bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 200_000_000_000_000,
            }))
                .to.emit(bridge, "TokenLocked")
                .withArgs(genericToken.address, otherAccount.address, tokensToLock);
        });

        it("Should revert on trying to lock more tokens than the approved value", async function () {
            const tokensToApprove = 5;
            const tokensToLock = 10;
            const { bridge, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToApprove);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToApprove);

            await expect(bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 200_000_000_000_000,
            }))
                .to.be.revertedWith("ERC20: insufficient allowance");
        })

        it("Should revert on trying to lock tokens without providing the correct value", async function () {
            const tokensToApprove = 5;
            const tokensToLock = 10;
            const { bridge, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToApprove);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToApprove);

            await expect(bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 150_000_000_000_000,
            }))
                .to.be.revertedWith("Sent value is not equal to 200000 gwei.");
        })

        it("Should release tokens", async function () {
            const { bridge, genericToken, bridgeOwner, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToRelease = 10;
            await genericToken.connect(tokenOwner).mint(bridge.address, tokensToRelease); 
            await bridge.connect(bridgeOwner).addTokensToRelease(otherAccount.address, genericToken.address, tokensToRelease);

            await expect(bridge.connect(otherAccount).release(genericToken.address, tokensToRelease))
                .to.emit(bridge, "TokenReleased")
                .withArgs(genericToken.address, otherAccount.address, tokensToRelease);
        })

        it("Should revert on trying to release more tokens than possible", async function () {
            const { bridge, genericToken, bridgeOwner, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToRelease = 5;
            const unsufficientAmount = 10;
            await genericToken.connect(tokenOwner).mint(bridge.address, tokensToRelease);
            await bridge.connect(bridgeOwner).addTokensToRelease(otherAccount.address, genericToken.address, tokensToRelease);

            await expect(bridge.connect(otherAccount).release(genericToken.address, unsufficientAmount))
                .to.be.revertedWith("You do not have sufficient funds for the operation.");
        })

        it("Should revert on trying to release tokens without the bridge having them", async function () {
            const { bridge, genericToken, bridgeOwner, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToRelease = 5;
            
            await bridge.connect(bridgeOwner).addTokensToRelease(otherAccount.address, genericToken.address, tokensToRelease);

            await expect(bridge.connect(otherAccount).release(genericToken.address, tokensToRelease))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        })

        it("Should be able to create new wrapped token and claim funds", async function () {
            const { bridge, genericToken, bridgeOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToClaim = 10;
            const firstClaim = 5;
            const secondClaim = 5;
            await bridge.connect(bridgeOwner).addTokensToClaim(otherAccount.address, genericToken.address, tokensToClaim);

            await expect(bridge.connect(otherAccount).claim(genericToken.address, firstClaim))
                .to.emit(bridge, "WrappedTokenAdded")
                .to.emit(bridge, "TokenClaimed");
            
            await expect(bridge.connect(otherAccount).claim(genericToken.address, secondClaim))
            .to.emit(bridge, "TokenClaimed");    
        })

        it("Should revert on trying to claim more tokens than possible", async function () {
            const { bridge, genericToken, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToClaim = 5;

            await expect(bridge.connect(otherAccount).claim(genericToken.address, tokensToClaim))
                .to.be.revertedWith("You do not have sufficient funds for the operation.");
        })

        it("Should burn tokens", async function () {
            const { bridge, genericToken, bridgeOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            const tokensToClaim = 10;
            const tokensToBurn = 10;
            await bridge.connect(bridgeOwner).addTokensToClaim(otherAccount.address, genericToken.address, tokensToClaim);

            await bridge.connect(otherAccount).claim(genericToken.address, tokensToClaim);

            const wrappedTokenAddress = await bridge.getWrappedToken(genericToken.address);

            await expect(bridge.connect(otherAccount).burn(wrappedTokenAddress, tokensToBurn))
                .to.emit(bridge, "TokenBurned")
                .withArgs(wrappedTokenAddress, otherAccount.address, tokensToBurn);
        });

        it("Should withdraw funds successfuly", async function () {
            const tokensToLock = 10;
            const { bridge, bridgeOwner, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToLock);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToLock);
            
            await bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 200_000_000_000_000,
            });

            const initialBalance = await bridgeOwner.getBalance();
            const withdrawAmount = 100_000_000_000_000;

            await bridge.connect(bridgeOwner).withdrawFunds(withdrawAmount);

            const updatedBalance = await bridgeOwner.getBalance();

            expect(updatedBalance).to.be.lessThan(initialBalance.add(withdrawAmount)); 
            expect(updatedBalance.add(1_000_000)).to.be.greaterThan(initialBalance.add(withdrawAmount));
        })

        it("Should revert on non-owner attempting to withdraw", async function () {
            const tokensToLock = 10;
            const { bridge, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToLock);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToLock);
            
            await bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 200_000_000_000_000,
            });

            const withdrawAmount = 100_000_000_000_000;

            await expect(bridge.connect(otherAccount).withdrawFunds(withdrawAmount))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should revert on attempting to withdraw more than possible", async function () {
            const tokensToLock = 10;
            const { bridge, bridgeOwner, genericToken, tokenOwner, otherAccount } = await loadFixture(deployBridgeAndGenericToken);
            await genericToken.connect(tokenOwner).mint(otherAccount.address, tokensToLock);
            await genericToken.connect(otherAccount).approve(bridge.address, tokensToLock);
            
            await bridge.connect(otherAccount).lock(genericToken.address, tokensToLock, {
                value: 200_000_000_000_000,
            });

            const initialBalance = await bridgeOwner.getBalance();
            const withdrawAmount = 500_000_000_000_000;

            await expect(bridge.connect(bridgeOwner).withdrawFunds(withdrawAmount))
                .to.be.revertedWith("Insufficient contract balance.");
        })

    })
})