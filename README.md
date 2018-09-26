# BOTP - Blockchain-based One-Time Password

Author: Enrique Santos


## One time password authenticator over Ethereum (or any other) blockchain. 

One-time passwords (OTP) are a form of HMAC (hash-based message authentication code). For a given service and a user of that service, they are subsequentialy generated on each connection as hashes from two pieces of data: 
1. one seed, usually called the *secret*, which is shared by server and user at the initial configuration step
2. something that changes each time, but is equal in server and client without communication between them

That second piece of data is what determines the type of OTP. The two used by usual OTP systems are HOTP and TOTP. In this document a third type of OTP based on blockchain is proposed, BOTP:
- *HOTP (HMAC-Based One-Time Password)*: uses a counter of the number of times that the user has been authenticated by the server, so that both, the client and the server, know it without transmiting it
- *TOTP (Time-Based One-Time Password)*: uses universal time in Unix format, starting from an agreed initial time, as well as a renewal interval, which is usually half a minute, both established when configuring the service
- *BOTP (Blockchain-Based One-Time Password)*: uses the hash of the block as an identifier of the time interval in which that block is the last one

At first glance it seems that the block height could also be used instead of the block hash, but that would have the disadvantage of not distinguishing between forks, in the case of coexisting different forks at the same time.

## Advantages and disadvantages of BOTP

### BOTP keys are not predictable

The one-time keys, OTP, are intended to increase security by being different each time, and to avoid being transmitted between client and server, so that they can not be intercepted. However, both HOTP and TOTP produce predictable keys, that is, given an initial shared secret, all future keys can be predicted. In BOTP, on the other hand, an OTP key can not be generated until the corresponding block is produced, because they are based on the block hash.

This allows the advantage **in HOTP** that the user can save in paper or text file the following 10 keys to use, for example, which is something usual, so that **no application or connection is needed** to obtain the OTP keys, but it is at the cost of needing to store more keys with security, and .

**In TOTP** this is not feasible because it is not known the time when the user is going to connect, but it would be possible to generate OTP keys in advance to be used at predetermined times, and if the clock of the device is well synchronized, it is not required the use of NTP time servers, that is, **no connection to any server is needed**.

**In BOTP**, however, **each key must be generated in the next moment of being requested**, because it requires the hash of the last block generated in the blockchain used for authentication. On the other hand, this requires a connection to a server in the blockchain network that provides the hash of the last block.

### Key synchronization

Another problematic aspect in both HOTP and TOTP is the synchronization of the keys between server and client. In HOTP, the synchronization is based on a counter of the number of connections made by the user. But if there are problems in the connection, it can happen that the client counts it as a valid connection and the server does not, or vice versa, so that there will be a lag between the server and client counters.

Something similar occurs in TOTP due to the fact that the clocks used by client and server may be out of synchrinization, and there is always a time since the server requests the OTP key until the client obtains and sends it, which is why it is provided an extra margin of time.

The methods used to take into account these situations, on the other hand relatively common, reduce security. In BOTP, however, the hash of the last generated block is the same for server and client at the same time, even though the clocks between both were very outdated. 

It can happen that a new block is produced since the server requests the OTP key until the client generates it, or since the client generates the OTP key until the server receives and checks it. In any case, the possibilities are very limited, because you only have to consider the case that a new block is generated in the time since the server asks the user for the OTP key until it is received. That time, therefore, should be less than the duration of two blocks, so that there are never more than two possible OTP keys against which to check the key received from the user. That time is enough in the current block chains, because the fastest one produce about 4 or 5 blocks per minute, that is, the user would have at least 20 seconds of margin to send the OTP key.


## Implementations

A reference implementation can be based on the one collected in the TOTP reference document, which is the RFC6238 document [https://tools.ietf.org/html/rfc6238]. Appendix A of that document contains an example implementation written in Java language.

The basic idea to adapt this code is to change each occurrence of the variable `time`, which represents the value of time, by a variable `blockHash` that contains the value of the hash of the last block of the chain of blocks chosen as a reference. Therefore, it is necessary to include the libraries that are necessary to read that value.

A test imlementation is included in the `./test` folder of this repository as both, a Proof-of-Concept of the BOTP algorithm, and a testing web application to verify other implementations, be the server side ones or the client side ones.

The server side could be implemented as a PAM module, in order to be usable on currently hosted services by just touching system configuration files without service interruption, the same way that the ubiquitous Google Authenticator does. 

Clients can be developed as mobile applications, browser extensions, or stand alone applications, as well as libraries integrated in other general propose applications. 



## Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International Public License

By exercising the Licensed Rights (defined below), You accept and agree to be bound by the terms and conditions of this Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International Public License ("Public License"). To the extent this Public License may be interpreted as a contract, You are granted the Licensed Rights in consideration of Your acceptance of these terms and conditions, and the Licensor grants You such rights in consideration of benefits the Licensor receives from making the Licensed Material available under these terms and conditions.


**Section 1 – Definitions.**

1.  **Adapted Material**  means material subject to Copyright and Similar Rights that is derived from or based upon the Licensed Material and in which the Licensed Material is translated, altered, arranged, transformed, or otherwise modified in a manner requiring permission under the Copyright and Similar Rights held by the Licensor. For purposes of this Public License, where the Licensed Material is a musical work, performance, or sound recording, Adapted Material is always produced where the Licensed Material is synched in timed relation with a moving image.
2.  **Copyright and Similar Rights**  means copyright and/or similar rights closely related to copyright including, without limitation, performance, broadcast, sound recording, and Sui Generis Database Rights, without regard to how the rights are labeled or categorized. For purposes of this Public License, the rights specified in Section  [2(b)(1)-(2)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s2b)  are not Copyright and Similar Rights.
3.  **Effective Technological Measures**  means those measures that, in the absence of proper authority, may not be circumvented under laws fulfilling obligations under Article 11 of the WIPO Copyright Treaty adopted on December 20, 1996, and/or similar international agreements.
4.  **Exceptions and Limitations**  means fair use, fair dealing, and/or any other exception or limitation to Copyright and Similar Rights that applies to Your use of the Licensed Material.
5.  **Licensed Material**  means the artistic or literary work, database, or other material to which the Licensor applied this Public License.
6.  **Licensed Rights**  means the rights granted to You subject to the terms and conditions of this Public License, which are limited to all Copyright and Similar Rights that apply to Your use of the Licensed Material and that the Licensor has authority to license.
7.  **Licensor**  means the individual(s) or entity(ies) granting rights under this Public License.
8.  **NonCommercial**  means not primarily intended for or directed towards commercial advantage or monetary compensation. For purposes of this Public License, the exchange of the Licensed Material for other material subject to Copyright and Similar Rights by digital file-sharing or similar means is NonCommercial provided there is no payment of monetary compensation in connection with the exchange.
9.  **Share**  means to provide material to the public by any means or process that requires permission under the Licensed Rights, such as reproduction, public display, public performance, distribution, dissemination, communication, or importation, and to make material available to the public including in ways that members of the public may access the material from a place and at a time individually chosen by them.
10.  **Sui Generis Database Rights**  means rights other than copyright resulting from Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996 on the legal protection of databases, as amended and/or succeeded, as well as other essentially equivalent rights anywhere in the world.
11.  **You**  means the individual or entity exercising the Licensed Rights under this Public License.  **Your**  has a corresponding meaning.

**Section 2 – Scope.**

1.  **License grant**.
    1.  Subject to the terms and conditions of this Public License, the Licensor hereby grants You a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise the Licensed Rights in the Licensed Material to:
        1.  reproduce and Share the Licensed Material, in whole or in part, for NonCommercial purposes only; and
        2.  produce and reproduce, but not Share, Adapted Material for NonCommercial purposes only.
    2.  Exceptions and Limitations. For the avoidance of doubt, where Exceptions and Limitations apply to Your use, this Public License does not apply, and You do not need to comply with its terms and conditions.
    3.  Term. The term of this Public License is specified in Section  [6(a)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s6a).
    4.  Media and formats; technical modifications allowed. The Licensor authorizes You to exercise the Licensed Rights in all media and formats whether now known or hereafter created, and to make technical modifications necessary to do so. The Licensor waives and/or agrees not to assert any right or authority to forbid You from making technical modifications necessary to exercise the Licensed Rights, including technical modifications necessary to circumvent Effective Technological Measures. For purposes of this Public License, simply making modifications authorized by this Section  [2(a)(4)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s2a4)  never produces Adapted Material.
    5.  Downstream recipients.
        
        1.  Offer from the Licensor – Licensed Material. Every recipient of the Licensed Material automatically receives an offer from the Licensor to exercise the Licensed Rights under the terms and conditions of this Public License.
        2.  No downstream restrictions. You may not offer or impose any additional or different terms or conditions on, or apply any Effective Technological Measures to, the Licensed Material if doing so restricts exercise of the Licensed Rights by any recipient of the Licensed Material.
        
    6.  No endorsement. Nothing in this Public License constitutes or may be construed as permission to assert or imply that You are, or that Your use of the Licensed Material is, connected with, or sponsored, endorsed, or granted official status by, the Licensor or others designated to receive attribution as provided in Section  [3(a)(1)(A)(i)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s3a1Ai).
2.  **Other rights**.
    
    1.  Moral rights, such as the right of integrity, are not licensed under this Public License, nor are publicity, privacy, and/or other similar personality rights; however, to the extent possible, the Licensor waives and/or agrees not to assert any such rights held by the Licensor to the limited extent necessary to allow You to exercise the Licensed Rights, but not otherwise.
    2.  Patent and trademark rights are not licensed under this Public License.
    3.  To the extent possible, the Licensor waives any right to collect royalties from You for the exercise of the Licensed Rights, whether directly or through a collecting society under any voluntary or waivable statutory or compulsory licensing scheme. In all other cases the Licensor expressly reserves any right to collect such royalties, including when the Licensed Material is used other than for NonCommercial purposes.

**Section 3 – License Conditions.**

Your exercise of the Licensed Rights is expressly made subject to the following conditions.

1.  **Attribution**.
    
    1.  If You Share the Licensed Material, You must:
        
        1.  retain the following if it is supplied by the Licensor with the Licensed Material:
            1.  identification of the creator(s) of the Licensed Material and any others designated to receive attribution, in any reasonable manner requested by the Licensor (including by pseudonym if designated);
            2.  a copyright notice;
            3.  a notice that refers to this Public License;
            4.  a notice that refers to the disclaimer of warranties;
            5.  a URI or hyperlink to the Licensed Material to the extent reasonably practicable;
        2.  indicate if You modified the Licensed Material and retain an indication of any previous modifications; and
        3.  indicate the Licensed Material is licensed under this Public License, and include the text of, or the URI or hyperlink to, this Public License.For the avoidance of doubt, You do not have permission under this Public License to Share Adapted Material.
    2.  You may satisfy the conditions in Section  [3(a)(1)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s3a1)  in any reasonable manner based on the medium, means, and context in which You Share the Licensed Material. For example, it may be reasonable to satisfy the conditions by providing a URI or hyperlink to a resource that includes the required information.
    3.  If requested by the Licensor, You must remove any of the information required by Section  [3(a)(1)(A)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s3a1A)  to the extent reasonably practicable.

**Section 4 – Sui Generis Database Rights.**

Where the Licensed Rights include Sui Generis Database Rights that apply to Your use of the Licensed Material:

1.  for the avoidance of doubt, Section  [2(a)(1)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s2a1)  grants You the right to extract, reuse, reproduce, and Share all or a substantial portion of the contents of the database for NonCommercial purposes only and provided You do not Share Adapted Material;
2.  if You include all or a substantial portion of the database contents in a database in which You have Sui Generis Database Rights, then the database in which You have Sui Generis Database Rights (but not its individual contents) is Adapted Material; and
3.  You must comply with the conditions in Section  [3(a)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s3a)  if You Share all or a substantial portion of the contents of the database.

For the avoidance of doubt, this Section [4](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s4) supplements and does not replace Your obligations under this Public License where the Licensed Rights include other Copyright and Similar Rights.

**Section 5 – Disclaimer of Warranties and Limitation of Liability.**

1.  **Unless otherwise separately undertaken by the Licensor, to the extent possible, the Licensor offers the Licensed Material as-is and as-available, and makes no representations or warranties of any kind concerning the Licensed Material, whether express, implied, statutory, or other. This includes, without limitation, warranties of title, merchantability, fitness for a particular purpose, non-infringement, absence of latent or other defects, accuracy, or the presence or absence of errors, whether or not known or discoverable. Where disclaimers of warranties are not allowed in full or in part, this disclaimer may not apply to You.**
2.  **To the extent possible, in no event will the Licensor be liable to You on any legal theory (including, without limitation, negligence) or otherwise for any direct, special, indirect, incidental, consequential, punitive, exemplary, or other losses, costs, expenses, or damages arising out of this Public License or use of the Licensed Material, even if the Licensor has been advised of the possibility of such losses, costs, expenses, or damages. Where a limitation of liability is not allowed in full or in part, this limitation may not apply to You.**

3.  The disclaimer of warranties and limitation of liability provided above shall be interpreted in a manner that, to the extent possible, most closely approximates an absolute disclaimer and waiver of all liability.

**Section 6 – Term and Termination.**

1.  This Public License applies for the term of the Copyright and Similar Rights licensed here. However, if You fail to comply with this Public License, then Your rights under this Public License terminate automatically.
2.  Where Your right to use the Licensed Material has terminated under Section  [6(a)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s6a), it reinstates:
    
    1.  automatically as of the date the violation is cured, provided it is cured within 30 days of Your discovery of the violation; or
    2.  upon express reinstatement by the Licensor.
    
    For the avoidance of doubt, this Section  [6(b)](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s6b)  does not affect any right the Licensor may have to seek remedies for Your violations of this Public License.
3.  For the avoidance of doubt, the Licensor may also offer the Licensed Material under separate terms or conditions or stop distributing the Licensed Material at any time; however, doing so will not terminate this Public License.
4.  Sections  [1](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s1),  [5](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s5),  [6](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s6),  [7](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s7), and  [8](https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode#s8)  survive termination of this Public License.

**Section 7 – Other Terms and Conditions.**

1.  The Licensor shall not be bound by any additional or different terms or conditions communicated by You unless expressly agreed.
2.  Any arrangements, understandings, or agreements regarding the Licensed Material not stated herein are separate from and independent of the terms and conditions of this Public License.

**Section 8 – Interpretation.**

1.  For the avoidance of doubt, this Public License does not, and shall not be interpreted to, reduce, limit, restrict, or impose conditions on any use of the Licensed Material that could lawfully be made without permission under this Public License.
2.  To the extent possible, if any provision of this Public License is deemed unenforceable, it shall be automatically reformed to the minimum extent necessary to make it enforceable. If the provision cannot be reformed, it shall be severed from this Public License without affecting the enforceability of the remaining terms and conditions.
3.  No term or condition of this Public License will be waived and no failure to comply consented to unless expressly agreed to by the Licensor.
4.  Nothing in this Public License constitutes or may be interpreted as a limitation upon, or waiver of, any privileges and immunities that apply to the Licensor or You, including from the legal processes of any jurisdiction or authority

# License pricing 


# Commercial activities

- 15 BTC per year .+ trade fee holders sweeper

OR

- 450 ETH per year + trade fee holders sweeper

Pubish in your app the transaction hash of the payment to this address 


BTC

[1HtdsiDvwf3ggjbP4w22UQBsWBiutfejwW](https://www.blockchain.com/btc/address/1HtdsiDvwf3ggjbP4w22UQBsWBiutfejwW)

ETH

[0x60cEC9c3B55FDF32c54063980200825050b2462D](https://etherscan.io/address/0xfFA2D61cbA573bC8047A7Af94AFeC5052934e564)

# Agricultural producers

1 % fee of tokens issued

trade fee holders sweeper


# Raw Materials

1 % fee of tokens issued

trade fee holders sweeper


# Contact

srdelabismo@lescovex.com
