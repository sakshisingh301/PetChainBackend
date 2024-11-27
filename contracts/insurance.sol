// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract insurance {
    struct AddingPolicyToPetChain {
        string petId;
        string ownerId;
        string providerName;
        string policyNumber;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
    }

    struct Policy {
        string policyNumber;
        uint256 totalCoverage;
        uint256 startDate;
        uint256 endDate;
        string[] coverageTypes;
        string[] coverageLimits;
        string[] deductibles;
        string[] limits;
        string[] notCoveredInPolicy;
    }

    struct SubmittingClaimsRequest {
        string petId;
        string claimId;
        uint256 claimedAmount;
        string treatmentType;
        string[] documents;
    }

    // Mappings
    mapping(string => Policy) public policies;
    mapping(string => AddingPolicyToPetChain) public petPolicies;
    mapping(string => bool) public preApprovalStatus;

    // Events
    event PreApprovalResult(
        string preApprovalStatus,
        string petId,
        string claimId,
        uint256 claimedAmount
    );
    event ApprovalResult(
        string approvalStatus,
        string claimId,
        string petId,
        string ownerId,
        uint256 reimbursedAmount
    );

    // Add a new policy
    function addPolicy(
        string memory _policyNumber,
        uint256 _totalCoverage,
        uint256 _startDate,
        uint256 _endDate,
        string[] memory _coverageTypes,
        string[] memory _coverageLimits,
        string[] memory _deductibles,
        string[] memory _limits,
        string[] memory _notCoveredInPolicy
    ) public {
        require(bytes(_policyNumber).length > 0, "Policy number is required");
        require(_endDate > _startDate, "End date must be after start date");

        policies[_policyNumber] = Policy({
            policyNumber: _policyNumber,
            totalCoverage: _totalCoverage,
            startDate: _startDate,
            endDate: _endDate,
            coverageTypes: _coverageTypes,
            coverageLimits: _coverageLimits,
            deductibles: _deductibles,
            limits: _limits,
            notCoveredInPolicy: _notCoveredInPolicy
        });
    }

    // Map a policy to a pet
    function addPolicyToPetChain(
        string memory _petId,
        string memory _ownerId,
        string memory _providerName,
        string memory _policyNumber,
        uint256 _coverageAmount,
        uint256 _startDate,
        uint256 _endDate
    ) public returns (string memory) {
        require(bytes(_petId).length > 0, "Pet ID is required");
        require(bytes(_policyNumber).length > 0, "Policy number is required");
        require(_endDate > _startDate, "End date must be after start date");
        require(bytes(petPolicies[_petId].policyNumber).length == 0, "This pet already has a policy");

        petPolicies[_petId] = AddingPolicyToPetChain({
            petId: _petId,
            ownerId: _ownerId,
            providerName: _providerName,
            policyNumber: _policyNumber,
            coverageAmount: _coverageAmount,
            startDate: _startDate,
            endDate: _endDate
        });

        return "Policy successfully added to PetChain";
    }

    // Pre-Approval function
    function preApproval(
        SubmittingClaimsRequest memory _claimsRequest
    ) public {
        AddingPolicyToPetChain memory policyForPet = petPolicies[_claimsRequest.petId];
        require(bytes(policyForPet.policyNumber).length > 0, "No policy exists for this petId");

        Policy memory policyDetails = policies[policyForPet.policyNumber];
        require(_claimsRequest.claimedAmount <= policyDetails.totalCoverage, "Claimed amount exceeds total coverage");

        bool isTreatmentTypeCovered = false;
        for (uint256 i = 0; i < policyDetails.coverageTypes.length; i++) {
            if (keccak256(abi.encodePacked(policyDetails.coverageTypes[i])) == keccak256(abi.encodePacked(_claimsRequest.treatmentType))) {
                isTreatmentTypeCovered = true;
                break;
            }
        }
        require(isTreatmentTypeCovered, "Treatment type is not covered under this policy");
        require(_claimsRequest.documents.length > 0, "Supporting documents must be provided");

        preApprovalStatus[_claimsRequest.claimId] = true;

        emit PreApprovalResult(
            "success",
            _claimsRequest.petId,
            _claimsRequest.claimId,
            _claimsRequest.claimedAmount
        );
    }

    // Approval function
    function approval(
        string memory _claimId,
        string memory _petId
    ) public {
        require(preApprovalStatus[_claimId], "Pre-approval status is not success");

        AddingPolicyToPetChain memory policyForPet = petPolicies[_petId];
        Policy memory policyDetails = policies[policyForPet.policyNumber];

        uint256 deductible = 0;
        if (policyDetails.deductibles.length > 0) {
            deductible = parseUint(policyDetails.deductibles[0]);
        }
        uint256 reimbursedAmount = policyForPet.coverageAmount > deductible
            ? policyForPet.coverageAmount - deductible
            : 0;

        emit ApprovalResult(
            "success",
            _claimId,
            _petId,
            policyForPet.ownerId,
            reimbursedAmount
        );
    }

    // Helper function to parse string to uint256
    function parseUint(string memory _a) internal pure returns (uint256) {
        bytes memory bresult = bytes(_a);
        uint256 result = 0;
        for (uint256 i = 0; i < bresult.length; i++) {
            if ((uint8(bresult[i]) >= 48) && (uint8(bresult[i]) <= 57)) {
                result = result * 10 + (uint8(bresult[i]) - 48);
            } else {
                break;
            }
        }
        return result;
    }
}
