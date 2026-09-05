#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, 'index.js');

const home = os.homedir();
let installedCount = 0;

console.log('🚀 Installing VPS Remote MCP Server...\n');

const configs = [
  {
    name: 'Claude Code',
    path: path.join(home, '.claude.json'),
    format: 'claude'
  },
  {
    name: 'Antigravity (agy)',
    path: path.join(home, '.gemini', 'config', 'mcp_config.json'),
    format: 'standard'
  },
  {
    name: 'Codex',
    path: path.join(home, '.codex', 'config.json'),
    format: 'standard'
  }
];

const mcpConfig = {
  type: 'stdio',
  command: 'node',
  args: [indexPath]
};

for (const cli of configs) {
  try {
    if (fs.existsSync(cli.path)) {
      let data = fs.readFileSync(cli.path, 'utf8');
      let json = JSON.parse(data);
      
      if (!json.mcpServers) json.mcpServers = {};
      json.mcpServers['vps-remote'] = mcpConfig;
      
      fs.writeFileSync(cli.path, JSON.stringify(json, null, 2));
      console.log(`✅ Successfully configured for ${cli.name}`);
      installedCount++;
    } else {
      console.log(`⏳ Skipped ${cli.name} (config file not found)`);
    }
  } catch (error) {
    console.error(`❌ Failed to configure ${cli.name}: ${error.message}`);
  }
}

// Cursor config is deeply nested and often SQLite or complex settings, 
// so we typically prompt the user to do it manually.
console.log('\n💡 For Cursor IDE or Cline, please follow the manual steps in README.md.');

if (installedCount > 0) {
  console.log(`\n🎉 Installation complete! Please restart your CLI(s) to use the new tools.`);
} else {
  console.log(`\n⚠️ No supported CLI configurations were found automatically. You may need to add it manually.`);
}
