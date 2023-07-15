import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

@Injectable()
export class VideoService {
  // Encrypt data
  encrypt(data, uuid) {
    return CryptoJS.AES.encrypt(data, uuid).toString();
  }

  // Decrypt data
  decrypt(encryptedData, uuid) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, uuid);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  createRandomID() {
    return crypto.randomBytes(16).toString('hex');
  }

  createM3U8Key() {
    return crypto.randomBytes(16);
  }
}
