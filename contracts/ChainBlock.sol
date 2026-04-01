
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import "./SupplyChain.sol";

contract CRXFactory {

    /* ---------------- STORAGE ---------------- */

    address[] public allSupplyChains;

    struct SupplyChainMeta {
        address contractAddress;
        address creator;
        string name;
        uint256 createdAt;
    }

    SupplyChainMeta[] public supplyChains;

    // creator => list of contracts
    mapping(address => address[]) public userSupplyChains;

    /* ---------------- EVENTS ---------------- */

    event SupplyChainCreated(
        address indexed creator,
        address indexed contractAddress,
        string name,
        uint256 timestamp
    );

    /* ---------------- CREATE FUNCTION ---------------- */

    function createSupplyChain(
        string memory name,
        address admin,
        address[] memory creators,
        address[] memory committers
    ) external returns (address) {

        require(bytes(name).length > 0, "Name required");
        require(admin != address(0), "Invalid admin");

        // deploy new supply chain contract
        SupplyChain newContract = new SupplyChain(
            admin,
            creators,
            committers
        );

        address deployedAddress = address(newContract);

        // store globally
        allSupplyChains.push(deployedAddress);

        supplyChains.push(
            SupplyChainMeta({
                contractAddress: deployedAddress,
                creator: msg.sender,
                name: name,
                createdAt: block.timestamp
            })
        );

        // store per user
        userSupplyChains[msg.sender].push(deployedAddress);

        emit SupplyChainCreated(
            msg.sender,
            deployedAddress,
            name,
            block.timestamp
        );

        return deployedAddress;
    }

    /* ---------------- VIEW FUNCTIONS ---------------- */

    function getAllSupplyChains()
        external
        view
        returns (SupplyChainMeta[] memory)
    {
        return supplyChains;
    }

    function getUserSupplyChains(address user)
        external
        view
        returns (address[] memory)
    {
        return userSupplyChains[user];
    }

    function totalSupplyChains() external view returns (uint256) {
        return supplyChains.length;
    }
}

0x2Ca47bcbB514353c386bB28DA8957a115A6d138f