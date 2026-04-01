// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyChain is ERC1155, Ownable {

    enum TokenType { Unknown, Request, Commit }

    uint256 private requestCounter;
    uint256 private commitCounter;

    mapping(uint256 => TokenType) public tokenTypes;
    mapping(uint256 => string) public tokenURIs;

    event RequestMinted(
        address indexed to,
        uint256 indexed tokenId,
        string uri
    );

    event CommitMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed requestId,
        string uri
    );

    mapping(address => uint256[]) public userRequest;
    mapping(uint256 => uint256[]) public repoCommits;

    constructor(
    address admin,
    address[] memory creators,
    address[] memory committers
) ERC1155("") Ownable(admin) {
    
    // optional: store roles manually if needed
}

    /* ---------------- REQUEST ---------------- */

    function mintRequest(
        address to,
        string memory repoUri
    ) external returns (uint256) {

        requestCounter++;
        uint256 tokenId = 1000 + requestCounter;

        _mint(to, tokenId, 1, "");

        tokenTypes[tokenId] = TokenType.Request;
        tokenURIs[tokenId] = repoUri;

        userRequest[to].push(tokenId);

        emit RequestMinted(to, tokenId, repoUri);
        return tokenId;
    }

    /* ---------------- COMMIT ---------------- */

    function mintCommit(
        address to,
        uint256 requestId,
        string memory commitUri
    ) external returns (uint256) {

        require(
            tokenTypes[requestId] == TokenType.Request,
            "Invalid requestId"
        );

        commitCounter++;
        uint256 tokenId = 2000 + commitCounter;

        _mint(to, tokenId, 1, "");

        tokenTypes[tokenId] = TokenType.Commit;
        tokenURIs[tokenId] = commitUri;

        userRequest[to].push(tokenId);
        repoCommits[requestId].push(tokenId);

        emit CommitMinted(to, tokenId, requestId, commitUri);
        return tokenId;
    }

    function uri(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return tokenURIs[tokenId];
    }
}


0x6d541f7dfbf99818f4dfaf249eb542a369eeb474