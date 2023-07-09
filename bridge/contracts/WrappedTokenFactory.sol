// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./tokens/WrappedToken.sol";

contract WrappedTokenFactory {
    function _addToken(address tokenContract) external returns(address) {
        // string memory wrappedName = "WrappedToken";
        // string memory wrappedSymbol = "WrappedSymbol";
        string memory wrappedName = string(abi.encodePacked("Wrapped", ERC20(tokenContract).name()));
        string memory wrappedSymbol = string(abi.encodePacked("W", ERC20(tokenContract).symbol()));
        // deploy new wrapped contract
        WrappedToken wrappedToken = new WrappedToken(wrappedName, wrappedSymbol);
        wrappedToken.transferOwnership(msg.sender);
        return address(wrappedToken);
    }
}