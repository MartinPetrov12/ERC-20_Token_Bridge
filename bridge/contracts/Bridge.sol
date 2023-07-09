pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/WrappedToken.sol";
import "./WrappedTokenFactory.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

    uint256 constant requiredLockValue = 200_000_000_000_000 wei;

    // a mapping between the address of the contract deployed on the source chain to the wrapped version on the target chain
    mapping(address => address) targetContract; 
    
    UserInformation userInformation;
    WrappedTokenFactory tokenFactory;

    event TokenLocked(address tokenContract, address userAddress, uint256 amount);
    event TokenClaimed(address tokenContract, address userAddress, uint256 amount);
    event TokenReleased(address tokenContract, address userAddress, uint256 amount);
    event TokenBurned(address tokenContract, address userAddress, uint256 amount);
    event WrappedTokenAdded(address originalTokenAddress, address wrappedTokenAddress);

    error UnsufficientFunds(address tokenContract, address user, uint256 amount);

    modifier checkAmount(uint256 tokens, uint256 amount) {
        require(tokens >= amount, "You do not have sufficient funds for the operation.");
        _;
    }

    /**
     * Constructor for the Bridge contract. On creationg, a token 
     * factory is being created. It is used for creatting wrapped 
     * versions of tokens.
     */
    constructor() {
        tokenFactory = new WrappedTokenFactory();
    }

    function getWrappedToken(address tokenContract) public view returns (address) {
        return targetContract[tokenContract];
    }

    function getTokensToRelease(address user, address tokenContract) external view returns(uint256) {
        return userInformation.tokensToRelease[user][tokenContract];
    }

    function getTokensToClaim(address user, address tokenContract) external view returns(uint256) {
        return userInformation.tokensToClaim[user][tokenContract];
    }

    /**
     * Increments the amount a user can release of a token. 
     * @param user - address of the user
     * @param tokenContract - the address of the token contract
     * @param amount - the added amount 
     */
    function addTokensToRelease(address user, address tokenContract, uint256 amount) external onlyOwner {
        userInformation.tokensToRelease[user][tokenContract] += amount;
    }

    /**
     * Increments the amount a user can claim of a token. 
     * @param user - address of the user
     * @param tokenContract - the address of the token contract
     * @param amount - the added amount 
     */
    function addTokensToClaim(address user, address tokenContract, uint256 amount) external onlyOwner {
        userInformation.tokensToClaim[user][tokenContract] += amount;
    }

    /**
     * The function locks a certain amount of tokens. It requires the 
     * user to has sent exactly 200000 gwei as a value of the transaction.
     * That is the fee for the bridge. If that is done, the tokens are locked
     * in the contract.
     * 
     * @param tokenContract - the address of the token's contract
     * @param amount - the amount of tokens to be locked
     */
    function lock(address tokenContract, uint256 amount) public nonReentrant payable {
        IERC20 token = IERC20(tokenContract);
        require(msg.value == requiredLockValue, "Sent value is not equal to 200000 gwei.");
        token.safeTransferFrom(msg.sender, address(this), amount);
        userInformation.lockedTokensForUser[msg.sender][tokenContract] += amount;
        emit TokenLocked(tokenContract, msg.sender, amount);
    }

    /**
     * The function releases a certain amount of a user's locked tokens.
     * 
     * @param tokenContract - the address of the token's generic contract
     * @param amount - the amount of token to be released
     */
    function release(address tokenContract, uint256 amount) public checkAmount(
        userInformation.tokensToRelease[msg.sender][tokenContract],
        amount
    ) {
        userInformation.tokensToRelease[msg.sender][tokenContract] -= amount;
        IERC20 token = IERC20(tokenContract);
        token.safeTransfer(msg.sender, amount);
        emit TokenReleased(tokenContract, msg.sender, amount);
    }

    /**
     * The function 'unlocks' an amount of the token and mints it to the user.
     * If there is no wrapped version of the token, the token factory is used
     * and a wrapped contract is created.
     * 
     * @param tokenContract - the address of the token to be claimed
     * @param amount - the amount of token to be claimed 
     */ 
    function claim(address tokenContract, uint256 amount) public checkAmount(
        userInformation.tokensToClaim[msg.sender][tokenContract],
        amount
    ) {
        userInformation.tokensToClaim[msg.sender][tokenContract] -= amount;
        address wrappedTokenAddress;

        if(targetContract[tokenContract] == address(0)) {
            wrappedTokenAddress = tokenFactory._addToken(tokenContract);
            targetContract[tokenContract] = wrappedTokenAddress; 
            emit WrappedTokenAdded(tokenContract, wrappedTokenAddress);
        } else {
            wrappedTokenAddress = targetContract[tokenContract];
        }

        WrappedToken(wrappedTokenAddress).mint(msg.sender, amount);
        emit TokenClaimed(wrappedTokenAddress, msg.sender, amount);
    }

    /**
     * The function destroys an amount of user's wrapped token.
     * 
     * @param tokenContract - the address of the wrapped token's contract
     * @param amount - amount of token to be burned
     */
    function burn(address tokenContract, uint256 amount) public nonReentrant {
        WrappedToken(tokenContract).burn(msg.sender, amount);
        emit TokenBurned(tokenContract, msg.sender, amount);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient contract balance.");
        payable(owner()).transfer(amount);
    }
}