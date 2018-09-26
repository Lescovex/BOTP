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
