import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const PREFIX = 'scrypt';
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

interface ScryptOptions { N: number; r: number; p: number; maxmem: number }

function scryptAsync(password: string | Buffer, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: 64 * 1024 * 1024 });
  return [PREFIX, COST, BLOCK_SIZE, PARALLELIZATION, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [prefix, cost, blockSize, parallelization, saltText, expectedText] = encoded.split('$');
  if (!prefix || prefix !== PREFIX || !cost || !blockSize || !parallelization || !saltText || !expectedText) return false;

  const expected = Buffer.from(expectedText, 'base64url');
  if (expected.length !== KEY_LENGTH) return false;

  try {
    const actual = await scryptAsync(password, Buffer.from(saltText, 'base64url'), KEY_LENGTH, {
      N: Number(cost), r: Number(blockSize), p: Number(parallelization), maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
