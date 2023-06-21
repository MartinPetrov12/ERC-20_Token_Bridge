import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WrappedToken", () => {
    async function deployToken() {
        const [tokenOwner, otherAccount] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("WrappedToken", tokenOwner);
        const genericToken = await TokenFactory.deploy("WTestToken", "WTT");

        return { genericToken, tokenOwner, otherAccount };
    }

    describe("Deployment", async function () {
        it("Should set the right owner", async function () {
            const { genericToken, tokenOwner } = await loadFixture(deployToken);
    
            expect(await genericToken.owner()).to.equal(tokenOwner.address);
        });
    });

    describe("Token functionalities", async function () {
        it("Should revert on non-owner trying to mint", async function () {
            const { genericToken, otherAccount } = await loadFixture(deployToken);

            await expect(genericToken.connect(otherAccount).mint(otherAccount.address, 50))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert on non-owner trying to burn", async function () {
            const { genericToken, otherAccount } = await loadFixture(deployToken);

            await expect(genericToken.connect(otherAccount).burn(otherAccount.address, 50))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should burn tokens", async function () {
            const { genericToken, tokenOwner, otherAccount } = await loadFixture(deployToken);

            await genericToken.connect(tokenOwner).mint(otherAccount.address, 100);

            await genericToken.connect(tokenOwner).burn(otherAccount.address, 50);
        })
    })

})