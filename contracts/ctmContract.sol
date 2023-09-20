// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// =========Thirdweb imports=========
import "@thirdweb-dev/contracts/base/ERC1155SignatureMint.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

// =========Openzeppelin imports=========
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// =========Internal imports=========
import "./IERC5006.sol";

/** =========NOTE=========
 * Contract implements thirdweb ERC1155 contract with SignatureMint extension
 * Contract implements IERC5006 standard for renting ERC1155 tokens
 * There is no record limit
 * There is no limit of rented nfts (function to do so is commented out) - number of rented nfts is not connected with minted nfts
 */

contract CTMRentable is ERC1155SignatureMint, IERC5006, PermissionsEnumerable {
    constructor(
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient
    )
        ERC1155SignatureMint(
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps,
            _primarySaleRecipient
        )
    {
        /** =========Setting up the roles=========
         *
         * The roles can be changed and new wallet can be added later in thirdweb dashboard
         */

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // Contract deployer(creator) is set up as admin of contract
        _setupRole(keccak256("MINTER_ROLE"), msg.sender); // Contract deployer(creator) is set up as wallet who can mint new nfts
    }

    using EnumerableSet for EnumerableSet.UintSet;
    mapping(uint256 => mapping(address => uint256)) private _frozens;
    mapping(uint256 => UserRecord) private _records;
    mapping(uint256 => mapping(address => EnumerableSet.UintSet))
        private _userRecordIds;
    uint256 _curRecordId;

    // Function to check if msg.sender(wallet sending transaction) is owner or is approved to so
    function isOwnerOrApproved(address owner) public view returns (bool) {
        require(
            owner == msg.sender || isApprovedForAll[owner][msg.sender],
            "only owner or approved wallet can perform this action"
        );
        return true;
    }

    // Function to check number of nfs rented to some wallet(account)
    function usableBalanceOf(
        address account,
        uint256 tokenId
    ) public view override returns (uint256 amount) {
        uint256[] memory recordIds = _userRecordIds[tokenId][account].values();
        for (uint256 i = 0; i < recordIds.length; i++) {
            if (block.timestamp <= _records[recordIds[i]].expiry) {
                amount += _records[recordIds[i]].amount;
            }
        }
    }

    // Function to check number of nfts rented from wallet(account)
    function frozenBalanceOf(
        address account,
        uint256 tokenId
    ) public view override returns (uint256) {
        return _frozens[tokenId][account];
    }

    // Funtion to which return record by record id
    function userRecordOf(
        uint256 recordId
    ) public view override returns (UserRecord memory) {
        return _records[recordId];
    }

    // function which allows user to buy nfts - only admin can initiate the transaction
    function buyNFT(
        address owner,
        address buyer,
        uint256 tokenId,
        uint64 amount
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount > 0, "amount must be greater than 0");
        require(buyer != address(0), "user cannot be the zero address");

        _safeTransferFrom(owner, buyer, tokenId, amount, "");
    }

    // Function for renting - sets given wallet as a user of nft for some period of time - only admin can initiate the transaction
    function createUserRecord(
        address owner,
        address user,
        uint256 tokenId,
        uint64 amount,
        uint64 expiry
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        // require(isOwnerOrApproved(owner));
        require(user != address(0), "user cannot be the zero address");
        require(amount > 0, "amount must be greater than 0");
        require(
            expiry > block.timestamp,
            "expiry must after the block timestamp"
        );

        /** It transfers number of nfts to another wallet address when nft is rented to:
         *      to block it from being used
         *      limits amount of nfts rented to nfts minted
         */
        /* _safeTransferFrom(
            owner,
            address(0x257b9EAC215954863263bED86c65c4e642D00905),
            tokenId,
            amount,
            ""
        );*/

        _frozens[tokenId][owner] += amount;
        _curRecordId++;
        _records[_curRecordId] = UserRecord(
            tokenId,
            owner,
            amount,
            user,
            expiry
        );
        _userRecordIds[tokenId][user].add(_curRecordId);
        emit CreateUserRecord(
            _curRecordId,
            tokenId,
            amount,
            owner,
            user,
            expiry
        );
        return _curRecordId;
    }

    function deleteUserRecord(
        uint256 recordId
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        UserRecord storage _record = _records[recordId];
        // require(isOwnerOrApproved(_record.owner));

        /** It transfers number of nfts to back to owner wallet when nft is renting is done to:
         *     unlock nft
         */
        /* _safeTransferFrom(
            address(0x257b9EAC215954863263bED86c65c4e642D00905),
            _record.owner,
            _record.tokenId,
            _record.amount,
            ""
        );*/
        _frozens[_record.tokenId][_record.owner] -= _record.amount;
        _userRecordIds[_record.tokenId][_record.user].remove(recordId);
        delete _records[recordId];
        emit DeleteUserRecord(recordId);
    }
}
