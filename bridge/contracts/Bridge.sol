pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/WrappedToken.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

struct UserInformation { 
   // a mapping between a user and the amount of tokens they have locked of a specific token
   mapping(address => mapping(address => uint256)) lockedTokensForUser;
   // a mapping between a user and the amount of tokens they can claim of a specific token
   mapping(address => mapping(address => uint256)) tokensToClaim;
   // a mapping between a user and the amount of tokens they can release of a specific token
   mapping(address => mapping(address => uint256)) tokensToRelease;
}

contract Bridge is Ownable, ReentrancyGuard {

    using SafeERC20 for IERC20;

    string constant valueError = "Sent value is not equal to 200000 gwei.";
    uint256 constant requiredLockValue = 200_000_000_000_000 wei;

    // a mapping between the address of the contract deployed on the source chain to the wrapped version on the target chain
    mapping(address => address) targetContract; 
    
    UserInformation userInformation;

    event TokenLocked(address tokenContract, address userAddress, uint256 amount);
    event TokenClaimed(address tokenContract, address userAddress, uint256 amount);
    event TokenReleased(address tokenContract, address userAddress, uint256 amount);
    event TokenBurned(address tokenContract, address userAddress, uint256 amount);
    event WrappedTokenAdded(address tokenContract);

    error UnsuccessfulTransfer(address tokenContract, address sender, address receiver, uint256 amount);
    error UnsuccessfulRelease(address tokenContract, address receiver, uint256 amount);
    error UnsufficientFunds(address tokenContract, address user, uint256 amount);
    error WrappedTokenDoesNotExist(address tokenContract);

    function getWrappedToken(address tokenContract) public view returns (address) {
        return targetContract[tokenContract];
    }

    function getTokensToRelease(address user, address tokenContract) external view returns(uint256) {
        return userInformation.tokensToRelease[user][tokenContract];
    }

    function getTokensToClaim(address user, address tokenContract) external view returns(uint256) {
        return userInformation.tokensToClaim[user][tokenContract];
    }

    function addTokensToRelease(address user, address tokenContract, uint256 amount) external onlyOwner {
        userInformation.tokensToRelease[user][tokenContract] += amount;
    }

    function addTokensToClaim(address user, address tokenContract, uint256 amount) external onlyOwner {
        userInformation.tokensToClaim[user][tokenContract] += amount;
    }

    /**
     * The function locks an amount of a token.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be locked
     */
    function lock(address tokenContract, uint256 amount) public nonReentrant payable {
        // Try transfering the funds
        IERC20 token = IERC20(tokenContract);
        require(msg.value == requiredLockValue, valueError);
        token.safeTransferFrom(msg.sender, address(this), amount);
        userInformation.lockedTokensForUser[msg.sender][tokenContract] += amount;
        emit TokenLocked(tokenContract, msg.sender, amount);
    }

    /**
     * The function releases the locked amount of tokens of a user.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be released
     */
    function release(address tokenContract, uint256 amount) public {
        // transfer funds from bridge to the user
        if(userInformation.tokensToRelease[msg.sender][tokenContract] < amount) {
            revert UnsufficientFunds(tokenContract, msg.sender, amount);
        }

        // update tokensToRelease
        userInformation.tokensToRelease[msg.sender][tokenContract] -= amount;

        IERC20 token = IERC20(tokenContract);

        token.safeTransfer(msg.sender, amount);
        emit TokenReleased(tokenContract, msg.sender, amount);
    }

    /**
     * The function 'unlocks' an amount of the token and mints it to the user.
     * Then an event is being emitted.
     * 
     * @param tokenContract - the address of the token generic contract
     * @param amount - amount of token to be claimed 
     */ 
    function claim(address tokenContract, uint256 amount) public {
        if(userInformation.tokensToClaim[msg.sender][tokenContract] < amount) {
            revert UnsufficientFunds(tokenContract, msg.sender, amount);
        }
        
        userInformation.tokensToClaim[msg.sender][tokenContract] -= amount;
        // check if a wrapped contract exists
        if(targetContract[tokenContract] == address(0)) {
            // If it does not, create a wrapped contract via '_addToken'
            _addToken(tokenContract);
        }
        // Then mint the amount to the user and emit an event
        WrappedToken(targetContract[tokenContract]).mint(msg.sender, amount);
        
        emit TokenClaimed(tokenContract, msg.sender, amount);
    }

    /**
     * The function destroys an amount of user's wrapped token and emits an event.
     * 
     * @param tokenContract - the address of the token generic contract
     * @param amount - amount of token to be burned
     */
    function burn(address tokenContract, uint256 amount) public nonReentrant {
        WrappedToken(tokenContract).burn(msg.sender, amount);
        emit TokenBurned(tokenContract, msg.sender, amount);
    }

    /**
     * If the bridge has not seen a token, it needs to create a wrapped version of it.
     * 
     * @param tokenContract - the address of the token generic contract
     */
    function _addToken(address tokenContract) private {
        string memory wrappedName = "WrappedToken";
        string memory wrappedSymbol = "WrappedSymbol";
        // string memory wrappedName = string(abi.encodePacked("Wrapped", ERC20(tokenContract).name()));
        // string memory wrappedSymbol = string(abi.encodePacked("W", ERC20(tokenContract).symbol()));
        // deploy new wrapped contract
        WrappedToken wrappedToken = new WrappedToken(wrappedName, wrappedSymbol);
        // add it to the 'mumbaiToInfura' mapping
        targetContract[tokenContract] = address(wrappedToken);
        emit WrappedTokenAdded(address(wrappedToken));
    }
}