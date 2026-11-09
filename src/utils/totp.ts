/**
 * RFC 6238 (TOTP) and RFC 4226 (HOTP) implementation
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, Apple Passwords, 1Password, etc.
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a random Base32 secret string
export function generateBase32Secret(length = 16): string {
  let secret = '';
  const randomBytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % BASE32_CHARS.length];
  }
  return secret;
}

// Convert Base32 to Uint8Array
export function base32ToUint8Array(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

// Pure JS SHA-1 fallback implementation for maximum cross-environment compatibility
function sha1(bytes: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const bitLength = bytes.length * 8;
  const paddingLength = (bytes.length % 64 < 56) ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const totalLength = bytes.length + paddingLength + 8;
  const padded = new Uint8Array(totalLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(totalLength - 4, bitLength, false);

  const w = new Uint32Array(80);

  for (let i = 0; i < totalLength; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 80; t++) {
      const val = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f = 0;
      let k = 0;
      if (t < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) >>> 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const outView = new DataView(result.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  return result;
}

// Pure JS HMAC-SHA1
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  let k = new Uint8Array(64);
  if (key.length > 64) {
    const hashedKey = sha1(key);
    k.set(hashedKey);
  } else {
    k.set(key);
  }

  const oPad = new Uint8Array(64 + 20);
  const iPad = new Uint8Array(64 + message.length);

  for (let i = 0; i < 64; i++) {
    oPad[i] = k[i] ^ 0x5c;
    iPad[i] = k[i] ^ 0x36;
  }
  iPad.set(message, 64);

  const innerHash = sha1(iPad);
  oPad.set(innerHash, 64);

  return sha1(oPad);
}

// Calculate TOTP for a given counter
export function computeHOTP(keyBytes: Uint8Array, counter: number): string {
  const counterBuffer = new Uint8Array(8);
  let tempCounter = counter;
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = tempCounter & 0xff;
    tempCounter = Math.floor(tempCounter / 256);
  }

  const hmac = hmacSha1(keyBytes, counterBuffer);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

// Calculate standard 6-digit TOTP
export function generateTOTP(secretBase32: string, timestamp = Date.now(), stepSeconds = 30): string {
  const keyBytes = base32ToUint8Array(secretBase32);
  const counter = Math.floor(timestamp / 1000 / stepSeconds);
  return computeHOTP(keyBytes, counter);
}

// Verify TOTP token with time-window drift tolerance (default ±1 window = ±30s)
export function verifyTOTP(token: string, secretBase32: string, window = 1, timestamp = Date.now(), stepSeconds = 30): boolean {
  if (!token || token.length !== 6) return false;
  const cleanToken = token.trim();
  const keyBytes = base32ToUint8Array(secretBase32);
  const currentCounter = Math.floor(timestamp / 1000 / stepSeconds);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const calculated = computeHOTP(keyBytes, currentCounter + errorWindow);
    if (calculated === cleanToken) {
      return true;
    }
  }

  return false;
}

// Seconds remaining in current 30s window
export function getRemainingSeconds(stepSeconds = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return stepSeconds - (now % stepSeconds);
}

// Build standard otpauth:// URL for QR code scanners
export function getOTPAuthURL(account: string, issuer: string, secretBase32: string): string {
  const encodedAccount = encodeURIComponent(account);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// Generate random backup codes (e.g. "8392-1049")
export function generateBackupCodes(count = 4): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}
