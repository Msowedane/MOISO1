
const crypto = require('crypto');

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = () => {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex || !/^[0-9a-fA-F]{64}$/.test(keyHex)) {
        throw new Error(
            'ENCRYPTION_KEY must be a 64-character hexadecimal key'
        );
    }

    return Buffer.from(keyHex, 'hex');
};

const generateIv = () => {
    return crypto.randomBytes(IV_LENGTH);
};

const deriveKeyFromPassword = (password, salt) => {
    if (typeof password !== 'string' || !password || !salt) {
        throw new Error('Password and salt are required');
    }

    return crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        32,
        'sha512'
    );
};

const encrypt = (text) => {
    if (text === null || text === undefined || text === '') {
        return text;
    }

    if (typeof text !== 'string') {
        throw new TypeError('Encryption input must be a string');
    }

    const key = getEncryptionKey();
    const iv = generateIv();

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        key,
        iv,
        { authTagLength: AUTH_TAG_LENGTH }
    );

    const encryptedData = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        encryptedData: encryptedData.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

const decrypt = (encryptedText) => {
    if (
        encryptedText === null ||
        encryptedText === undefined ||
        encryptedText === ''
    ) {
        return encryptedText;
    }

    if (
        typeof encryptedText !== 'object' ||
        !/^[0-9a-fA-F]{24}$/.test(encryptedText.iv || '') ||
        !/^[0-9a-fA-F]{32}$/.test(encryptedText.authTag || '') ||
        typeof encryptedText.encryptedData !== 'string' ||
        !/^(?:[0-9a-fA-F]{2})*$/.test(encryptedText.encryptedData)
    ) {
        throw new Error('Invalid encrypted data format');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedText.iv, 'hex');
    const authTag = Buffer.from(encryptedText.authTag, 'hex');
    const ciphertext = Buffer.from(encryptedText.encryptedData, 'hex');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        iv,
        { authTagLength: AUTH_TAG_LENGTH }
    );

    decipher.setAuthTag(authTag);

    const decryptedData = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);

    return decryptedData.toString('utf8');
};

module.exports = {
    getEncryptionKey,
    generateIv,
    deriveKeyFromPassword,
    encrypt,
    decrypt
};
