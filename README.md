# BOTP

Author Enrique Santos

One time password over ethereum blockchain

Advantages and disadvantages of BOTP

OTP keys not predictable

The one-time keys, OTP, are intended to increase security by being different each time and to avoid being transmitted between client and server, so that they can not be intercepted. However, both HOTP and TOTP produce predictable keys, that is, given an initial shared secret, all future keys can be predicted. In BOTP, on the other hand, an OTP key can not be generated until the corresponding block is produced, because they are based on the block hash.

This allows the advantage in HOTP that the user can save in paper or text file the following 10 keys to use, for example, which is something usual, so that no application will not need to obtain its OTP key.

In TOTP this is not feasible because it is not known when the user is going to connect, but it would be possible to generate OTP keys in advance to be used at predetermined times, and if the clock of the device is well synchronized, it is not required neither the use of NTP time servers, that is, no connection to any third-party server is needed.

In BOTP, however, each key must be generated in the next moment to request it, because it requires the hash of the last block generated in the chain of blocks used for authentication. On the other hand, this requires a connection to a server in the blockchain network that provides the hash of the last block.
Key synchronization

Another problematic aspect in both HOTP and TOTP is the synchronization of the keys between server and client. In HOTP, the synchronization is based on a counter of the number of connections made. But when there are problems in the connection, it can happen that the client counts it as a valid connection and the server does not, or vice versa, with which there will be a lag between the server and client counters.

Something similar occurs in TOTP due to the fact that the clocks used by client and server may be out of phase for a few seconds, and there is always a time since the server requests the OTP key until the client obtains and sends it, which is why provide an extra margin of time.

The methods used to take into account these situations, on the other hand relatively common, reduce security. In BOTP, however, the hash of the last generated block is the same for server and client at the same time, even though the clocks between both were very outdated. It can happen that since the server requests the OTP key until the client generates a block change, or since the client generates the OTP key until the server receives and checks it. In any case, the possibilities are very limited, because you only have to consider the case that a new block is generated in the time since the server asks the user for the OTP key until it receives it. That time, therefore, should be less than the duration of two blocks, so that there are never more than two possible OTP keys against which to check the key sent by the user. That time is enough in the current block chains, because the fastest produce in the order of 4 or 5 blocks per minute, that is, the user would have at least 20 seconds of margin to send the OTP key.



# Reference implementation

If the new BOTP algorithm is intended to be adopted by the IETF as a possible RFC candidate for a standard, it is best to create a baseline implementation based on the one collected in the TOTP reference document, which is the RFC6238 document. Appendix A of this document contains an example implementation written in Java language.

The basic idea to adapt this code is to change each occurrence of the variable 'time', which represents the value of time, by a variable 'blockHash' that contains the value of the hash of the last block of the chain of blocks chosen as a reference. Therefore, it is necessary to include the libraries that are necessary to read said value.
