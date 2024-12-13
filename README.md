                       **PetChain: Blockchain-Based Pet Health and Identification Platform**
__**Overview**__

PetChain is a blockchain-powered platform designed to simplify pet registration, health record management, lost and found services, ownership transfers, and insurance claims. By leveraging the immutability and transparency of blockchain technology, PetChain ensures secure and tamper-proof management of pet-related information.

**Features-**

**1. Pet Registration**

**Account Creation:** Pet owners can create accounts by providing personal details and setting up login credentials. Verification is performed via email or phone.

**Pet Registration Form:** Owners can register their pets with details and Pet profile will be created.

**2. Lost and Found Service**

**Mark as Lost:** Owners can update their pet’s status to “Lost” and provide additional details such as last known location and special notes.

**Finder Actions:** Finders can access the pet’s profile by entering its unique ID or scanning a tag.

**Secure Communication:** Finders can notify owners and optionally share the pet’s last known location via secure messaging.

**Blockchain Logging:** Lost and found events are logged immutably on the blockchain.

**3. Health Record Management**

**Owner Updates:** Pet owners can upload health records such as vaccination details, allergies, and minor illnesses.

**Veterinarian Access:** Authorized veterinarians can add medical diagnoses, prescriptions, and treatment plans to the pet’s profile.

**Data Privacy:** Health records are visible only to owners and veterinarians.

**4. Ownership Transfer**

**Initiate Transfer:** Allowing owners to initiate ownership transfer with a secure request, generating an approval token for validation of transfer.

**Email Notification:** Notify the new owner via email with an approval link for secure transfer.

**Approval Process:** Validate pet details and ownership hash from databases, ensuring secure transfer of pet details.

**Hash Generation and Logging:** Generate a transfer hash, log the event in ResDB, and update MongoDB with new ownership details (new owner’s name, ID, email, and so on). Transfer Status is displayed for a smooth user experience.

**5. Insurance Claim Management**

**Link Existing Insurance:** Owners can link existing insurance policies to their pet’s profile by providing policy details through smart contract.

**Submit Claims:** Pet owners can upload required documents for insurance claims, including vet bills and medical reports.

**Smart Contract Pre-Approval:** Claims are pre-validated by smart contracts before submission to the insurance provider.

**Claim Status Updates:** Owners are notified about claim status (approved/denied) directly on the platform.

**Technology Stack**

**Frontend**
React.js , MaterialUI

**Backend**
Node.js, expressjs


**Database**
ResilientDB (Blockchain-based database)
, mongoDB

**Blockchain**
Practical Byzantine Fault Tolerance (PBFT)  blockchain protocol for logging events and managing smart contracts

Link for frontend repo [PetChainPlus](https://github.com/nehapradeep/PetChainPlus)

For more info check out this blog [PetChain](https://blog.resilientdb.com/2024/12/08/PetChain.html)


