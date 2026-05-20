import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SOUNDS_DIR = './AbilitySounds';
const MAPPING_FILE = './src/data/soundMapping.json';

// Static list of all agents and slots to ensure deterministic mappings
const AGENTS = [
  'astra', 'breach', 'brimstone', 'chamber', 'clove', 'cypher', 'deadlock', 
  'fade', 'gekko', 'harbor', 'iso', 'jett', 'kayo', 'killjoy', 'miks', 
  'neon', 'omen', 'phoenix', 'raze', 'reyna', 'sage', 'skye', 'sova', 
  'tejo', 'veto', 'viper', 'vyse', 'waylay', 'yoru'
];

const SLOTS = ['c', 'q', 'e', 'x'];

function getHash(str) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 10);
}

function run() {
  if (!fs.existsSync(SOUNDS_DIR)) {
    console.error(`Error: Sounds directory "${SOUNDS_DIR}" does not exist.`);
    process.exit(1);
  }

  console.log('Starting sound file obfuscation...');
  const mapping = {};
  let renamedCount = 0;
  let skippedCount = 0;

  for (const agent of AGENTS) {
    for (const slot of SLOTS) {
      const key = `${agent}_${slot}`;
      const hash = getHash(key);
      mapping[key] = hash;

      const originalFile = path.join(SOUNDS_DIR, `${key}.mp3`);
      const obfuscatedFile = path.join(SOUNDS_DIR, `${hash}.mp3`);

      if (fs.existsSync(originalFile)) {
        // If the obfuscated file already exists for some reason, delete the old one
        if (fs.existsSync(obfuscatedFile)) {
          fs.unlinkSync(originalFile);
          console.log(`Removed duplicate original: ${key}.mp3`);
        } else {
          fs.renameSync(originalFile, obfuscatedFile);
          console.log(`Renamed: ${key}.mp3 -> ${hash}.mp3`);
          renamedCount++;
        }
      } else if (fs.existsSync(obfuscatedFile)) {
        skippedCount++;
      }
    }
  }

  // Write mapping to JSON file
  const mappingDir = path.dirname(MAPPING_FILE);
  if (!fs.existsSync(mappingDir)) {
    fs.mkdirSync(mappingDir, { recursive: true });
  }

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`\nMapping written to ${MAPPING_FILE}`);
  console.log(`Successfully processed: ${renamedCount} renamed, ${skippedCount} already obfuscated.`);
}

run();
