import JSEncrypt from "jsencrypt";

const PEM_KEY = `-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAs0F5Y7AQJ30s2wbKy3lBtnL1srJkPwqA+B4KA+DsJAlEmZphhPcs
jKYnnS8oaSUsnghZsIAeB0HHLWoToRjYge3ZfyVnAtib2t5Gt3g3J+aHa9rBjD0E
sMGT+XLTANZFFWWh3h/ybmCAjxUwaQdy+lvsSrIrFtMWGWcFs03LK8LFsxCdGnoL
8Npoy6QojD/vUe/S9V+OcTmlSl0o0V99rRNjZ/8G10A6Da4Mbzl6U26MljKbGKtL
YmsgCpSjLbo+gm7XUxKxxqk++moL3/APs63fICF6HEZma7VJr9aUTMp5x8NRpvu0
qZuVMpMP2CB/yCOzUknQqxrxVCmNO0wS+nQhhTMQ1dvSziI/Um4VFBCtHwhvb1/D
Yf4DAHxkkKeg6JISJTyHtkIp+wKE222nh2Q1ogTlEFn5BVq/g6gtr/LPwdMa3FV/
P0wpMtsC0r3CbduBbYPf5QrpzHuVLQoTeMP+28oEgsqrZrfJnonGzQCxJEK2YrWj
tAhM1Yi0WNmjmsg17acMgFNpYlPwe97aNGhEeV9ju3akHbm5H9Ced/8UjF0TVarh
JvKZ2dFWJ+HYW64Ty4raBvSQxAwGaYBK/+1dYnwuLrQvT6LTnmuhRSgROfJpUizt
tHGgJuA2C0SfmWsXdOC/nBJ3dFvhrPc0+BIempbb2/THTOENL4PU2I8CAwEAAQ==
-----END RSA PUBLIC KEY-----`;

export const encrypt = (plaintext: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(PEM_KEY);
  return encryptor.encrypt(plaintext);
};
