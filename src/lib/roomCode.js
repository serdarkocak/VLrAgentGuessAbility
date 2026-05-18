const CHARS = 'BCDFGHJKLMNPQRSTVWXYZ';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function normalizeRoomCode(input) {
  return input.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}
