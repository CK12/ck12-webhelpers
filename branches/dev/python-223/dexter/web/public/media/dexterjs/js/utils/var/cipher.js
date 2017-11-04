define([], function() {
    return {
        unhexlify: function(str) {
            var result = '';
            for (var i=0, l=str.length; i<l; i+=2) {
                result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
            }
            return result;
        },
        hexlify: function(str) {
            var result = '';
            var padding = '00';
            for (var i=0, l=str.length; i<l; i++) {
                var digit = str.charCodeAt(i).toString(16);
                var padded = (padding+digit).slice(-2);
                result += padded;
            }
            return result;
        },
        rpad: function(str, pad, len) {
            if (str != null && typeof str === 'string') {
                while (str.length < len) {
                    str += pad;
                }
            }
            return str;
        },
        encode: function(key, clear) {
            var enc = [];
            var clear = this.rpad(String(clear), 'z', 20);
            for (var i = 0; i < clear.length; i++) {
                var key_c = key[i % key.length];
                var enc_c = String.fromCharCode((clear[i].charCodeAt(0) + key_c.charCodeAt(0)) % 256);
                enc.push(enc_c);
            }
            return enc.join("");
        },
        decode: function(key, enc) {
            var dec = [];
            for (var i = 0; i < enc.length; i++) {
                var key_c = key[i % key.length];
                var dec_c = String.fromCharCode((256 + enc[i].charCodeAt(0) - key_c.charCodeAt(0)) % 256);
                dec.push(dec_c);
            }
            return dec.join("").replace(/z+$/, '');
        }
    };
});
