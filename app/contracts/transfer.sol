// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PetOwnership {
    struct PetOwnershipDetails {
        string petId;
        string status; 
        string eventDescription;  
        string timeStamp;
    }

    // Mapping of owner ID to pet ownership details
    mapping(string => PetOwnershipDetails) public ownershipRegistry;

    // Events for logging transfer
    event OwnershipTransferred(string indexed oldOwnerId, string indexed newOwnerId, string petId);
    event PetOwnershipCleared(string indexed oldOwnerId, string petId);

    function registerPet(
        string memory ownerId,
        string memory petId,
        string memory status,
        string memory eventDescription,
        string memory timeStamp
    ) public {
        ownershipRegistry[ownerId] = PetOwnershipDetails({
            petId: petId,
            status: status,
            eventDescription: eventDescription,
            timeStamp: timeStamp
        });
    }

    function transferOwnership(
        string memory oldOwnerId,
        string memory newOwnerId,
        string memory petId,
        string memory timeStamp
    ) public {
        // Clear ownership details for the old owner
        ownershipRegistry[oldOwnerId] = PetOwnershipDetails({
            petId: "",
            status: "inactive",
            eventDescription: "ownership cleared",
            timeStamp: timeStamp
        });

        emit PetOwnershipCleared(oldOwnerId, petId);

        // Register the pet under the new owner
        ownershipRegistry[newOwnerId] = PetOwnershipDetails({
            petId: petId,
            status: "active",
            eventDescription: "ownership transfer",
            timeStamp: timeStamp
        });

        emit OwnershipTransferred(oldOwnerId, newOwnerId, petId);
    }

    function getOwnershipDetails(string memory ownerId)
        public
        view
        returns (PetOwnershipDetails memory)
    {
        return ownershipRegistry[ownerId];
    }
}
