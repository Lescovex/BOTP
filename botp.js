/*  BOTP (Blockchain authenticator algorithm, for demo and test)
        Author: Enrique Santos, september 2018

Modified from Russ Sayers code on this link: 
http://blog.tinisles.com/2011/10/google-authenticator-one-time-password-algorithm-in-javascript/

SHA-3 is used, as it is the currrently recommended hash function, instead of 
SHA-1 and SHA2. Library jsSHA is used for HMAC and SHA-3: 
http://caligatio.github.com/jsSHA/ 

HMAC is computed from the shared secret and the hash of the last block, which 
is taken by the BlockCypher API. Ethereum network is used as primary option, but 
other blockchains offered by that API are: Bitcoin, Litecoin, Dash and Dogecoin. 

JQuery 3.1.1 is used to access and set web interface elements.

*/

  
$(function () {
    updateOtp();

    $('#update').click(function () {
        updateOtp();
    });

    $('#blockchain').change(function () {
        updateOtp();
    });

});

function updateOtp() {
        
    var key = base32tohex( $('#secret').val() );
    var configURI = 'otpauth://botp/' + $('#userAtServer').val() + '?secret=' + $('#secret').val();

    $('#secretHex').text(key);
    $('#secretHexLength').text(key.length * 4 + ' bits'); 
    $('#configURI').text(configURI);
    $('#qrImg').attr('src', 
        'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=200x200&chld=M|0&cht=qr&chl=' 
        + configURI);
    $('#hmac').empty();

    // updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
    var shaObj = new jsSHA("SHA3-256", "HEX");  // SHA-3 used (keccak)
    try {
        shaObj.setHMACKey(key, "HEX");

        var blockchain = $('#blockchain').val();
        
        $.get( "https://api.blockcypher.com/v1/" + blockchain + "/main", function( result ) {
            var latestBlock = JSON.parse(result);
            
            $('#blockhash').text('0x' + latestBlock.hash);
            shaObj.update(latestBlock.hash);

            $('#blockcount').text(latestBlock.height);

            var hmac = shaObj.getHMAC("HEX");
                
            // offset is the value of the last hex digit (half byte) of hmac
            var offset = hex2dec(hmac.substring(hmac.length - 1));
            
            var part = hmac.substr(0, offset * 2);
            labelAppend('label-default', part);

            var otp = hmac.substr(offset * 2, 8);
            labelAppend('label-primary', otp);

            // var part3 = hmac.substr(offset * 2 + 8, hmac.length - offset);
            part = hmac.substr(offset * 3 + 8 - hmac.length);
            labelAppend('label-default', part);

            var otp = '' + ( hex2dec(otp) % 1000000 );
            while (otp.length < 6) { otp = '0' + otp; } // left padding with '0'
            $('#otp').text( otp );
            
        }, "text");
    }
    catch(err) {
        labelAppend('label-primary', err.message);
        $('#otp').text("");
        console.log(err.message);
    }
}

function labelAppend(label, part) {
    $('#hmac').append($('<span/>')
        .attr('style','padding-left:0;padding-right:0;font-family:Lucida Console;')
        .addClass('label ' + label)
        .append(part));
}

function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }

function hex2dec(s) { return Math.abs(parseInt(s, 16)); }

function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";

    for (var character of base32) {
        var val = base32chars.indexOf(character.toUpperCase());
        bits = bits + leftpad(val.toString(2), 5, '0');
    }

    for (var i = 0; i <= bits.length - 4; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;
}

function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
}
