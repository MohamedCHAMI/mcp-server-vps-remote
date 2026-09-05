# MCP Server: VPS Remote Control

A Model Context Protocol (MCP) server that enables AI assistants (like Claude) to execute SSH commands and transfer files (SCP) directly to your remote VPS environments.

This allows Claude to securely act as a remote control, executing commands on a remote server directly from your local terminal.

## Features

- **`execute_ssh_command`**: Execute arbitrary bash commands on a remote VPS via SSH.
- **`scp_upload`**: Upload local files to the remote server.
- **`scp_download`**: Download remote files to your local machine.

*Note: This server assumes you have SSH key-based authentication configured on your machine for the target VPS. It does not handle interactive password prompts.*

## Installation

1. Clone this repository to your machine (e.g., `~/.claude/mcp/vps_remote`):
   ```bash
   git clone https://github.com/MohamedCHAMI/mcp-server-vps-remote.git ~/.claude/mcp/vps_remote
   cd ~/.claude/mcp/vps_remote
   npm install
   ```

2. Configure Claude Code to use this MCP server. Add the following to your global `~/.claude.json` under `mcpServers`:

   ```json
   "mcpServers": {
     "vps-remote": {
       "type": "stdio",
       "command": "node",
       "args": [
         "/absolute/path/to/your/home/.claude/mcp/vps_remote/index.js"
       ]
     }
   }
   ```

3. Restart your Claude CLI.

## Usage

Simply ask your AI assistant to execute a command on your VPS.

**Example Prompts:**
- "Check the docker logs on my VPS at user@192.168.1.50"
- "Upload my local build folder to user@example.com:/var/www/html"
- "Download the nginx config from root@myserver to my desktop"

## Security

This MCP server executes commands directly using Node.js `child_process.exec`. It relies entirely on your local `ssh` and `scp` configuration.
- No passwords or credentials are hardcoded.
- You must manage your SSH keys securely via `ssh-agent`.
- **Warning:** Granting an AI the ability to execute arbitrary SSH commands means the AI can perform destructive actions on the remote server. Use with caution and ideally within Auto Mode so you can review commands before execution.

## License

MIT
