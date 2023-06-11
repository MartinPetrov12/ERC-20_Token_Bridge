pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Bridge is Ownable {

    // a mapping between the address of the contract deployed on Mumbai to the wrapped version on Infura
    mapping(address => address) mumbaiToInfura; 

    // a mapping between a user and the amount of tokens they have locked of a specific token
    mapping(address => mapping(address => uint256)) addressToLockedToken;

    event TokenLocked(address tokenContract, address userAddress, uint256 amount);
    event TokenClaimed(address tokenContract, address userAddress, uint256 amount);
    event TokenReleased(address tokenContract, address userAddress, uint256 amount);
    event TokenBurned(address tokenContract, address userAddress, uint256 amount);
    event TokenAdded(address tokenContract);

    /**
     * The function locks an amount of a token.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be locked
     */
    function lock(address tokenContract, uint256 amount) public {
        // transfer funds from user to bridge
        // Update addressToLockedToken
        // Emit event
    }

    /**
     * The function releases the locked amount of tokens of a user.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be released
     */
    function release(address tokenContract, uint256 amount) public onlyOwner {
        // transfer funds from bridge to the user
        // update addressToLockedToken
        // Emit event
    }

    /**
     * The function 'unlocks' an amount of the token and mints it to the user.
     * Then an event is being emitted.
     * 
     * @param tokenContract - the address of the token generic contract
     * @param user - the address to which tokens will be minted
     * @param amount - amount of token to be claimed 
     */ 
    function claim(address tokenContract, address user, uint256 amount) public onlyOwner {
        // check if a wrapped contract exists via the mapping 'mumbaiToInfura'
        // If it does not, create a wrapped contract via 'addToken'
        // Then mint the amount to the user and emit an event
    }

    /**
     * The function destroys an amount of user's wrapped token and emits an event.
     * 
     * @param tokenContract - the address of the token generic contract
     * @param amount - amount of token to be burned
     */
    function burn(address tokenContract, uint256 amount) public {
        // burn the the token
        // emit an event
    }

    /**
     * If the bridge has not seen a token, it needs to create a wrapped version of it.
     * 
     * @param tokenContract - the address of the token generic contract
     */
    function _addToken(address tokenContract) private onlyOwner{
        // deploy new wrapped contract
        // add it to the 'mumbaiToInfura' mapping
    }
}