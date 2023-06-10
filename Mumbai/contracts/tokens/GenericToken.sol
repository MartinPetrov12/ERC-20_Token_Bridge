pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract GenericToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
}