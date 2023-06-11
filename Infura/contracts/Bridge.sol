pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/GenericToken.sol";
import "./tokens/WrappedToken.sol";

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
        GenericToken(tokenContract).transferFrom(msg.sender, address(this), amount);
        // Update addressToLockedToken
        addressToLockedToken[msg.sender][tokenContract] += amount;
        // Emit event
        emit TokenLocked(tokenContract, msg.sender, amount);
    }

    /**
     * The function releases the locked amount of tokens of a user.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be released
     */
    function release(address tokenContract, uint256 amount) public onlyOwner {
        // transfer funds from bridge to the user
        require(addressToLockedToken[msg.sender][tokenContract] >= amount);
        // update addressToLockedToken
        addressToLockedToken[msg.sender][tokenContract] -= amount;
        // Emit event
        emit TokenReleased(tokenContract, msg.sender, amount);
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
        if(mumbaiToInfura[tokenContract] == address(0)) {
            // If it does not, create a wrapped contract via 'addToken'
            _addToken(tokenContract);
        }
        // Then mint the amount to the user and emit an event
        WrappedToken(mumbaiToInfura[tokenContract]).mint(user, amount);
        emit TokenClaimed(tokenContract, user, amount);
    }

    /**
     * The function destroys an amount of user's wrapped token and emits an event.
     * 
     * @param tokenContract - the address of the token generic contract
     * @param amount - amount of token to be burned
     */
    function burn(address tokenContract, uint256 amount) public {
        require(mumbaiToInfura[tokenContract] != address(0), "There is no wrapped version of this token");
        WrappedToken(mumbaiToInfura[tokenContract]).burn(msg.sender, amount);
        emit TokenBurned(tokenContract, msg.sender, amount);
    }

    /**
     * If the bridge has not seen a token, it needs to create a wrapped version of it.
     * 
     * @param tokenContract - the address of the token generic contract
     */
    function _addToken(address tokenContract) private {
        // deploy new wrapped contract
        WrappedToken wrappedToken = new WrappedToken();
        // add it to the 'mumbaiToInfura' mapping
        mumbaiToInfura[tokenContract] = address(wrappedToken);
    }
}