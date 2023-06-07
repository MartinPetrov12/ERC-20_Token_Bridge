pragma solidity 0.8.18;

contract Bridge {

    // a mapping between the addresses of a generic contract to its wrapped contract
    mapping(address => address) genericToWrapped; 

    // a mapping between a user and the amount of tokens they have locked of a specific token
    mapping(address => mapping(address => uint256)) addressToLockedToken;

    event TokenLocked();
    event TokenClaimed();
    event TokenReleased();
    event TokenBurned();
    event TokenMinted();
    event TokenAdded();

    function lock() public {

    }

    function release() public {

    }
     
    function claim() public {

    }

    function burn() public {

    }

    function mint() public {

    }

    /**
     * If the bridge has not seen a token, it needs to create a wrapped version of the token.
     */
    function addToken() internal {
        // create wrapped token
    }
}