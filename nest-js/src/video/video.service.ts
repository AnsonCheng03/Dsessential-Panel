import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

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

  createM3U8Key() {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
}
