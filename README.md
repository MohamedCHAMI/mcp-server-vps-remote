<div align="center">
  <h1>🚀 MCP Server: VPS Remote Control</h1>
  <p><strong>A secure, seamless bridge between your AI Assistant and your remote servers.</strong></p>
  <p><i>Works with Claude Code, Antigravity (agy), Codex, Cursor, Windsurf, and any MCP-compatible client!</i></p>
</div>

---

## 📖 Overview

The **VPS Remote Control** MCP (Model Context Protocol) server allows your local AI assistant to directly execute commands and transfer files on any of your remote servers via SSH and SCP.

Instead of manually logging into your VPS to check logs, restart services, or deploy code, you simply tell your AI to do it. The AI uses this MCP server to seamlessly execute the necessary bash commands directly on your server.

### How it Works

```mermaid
sequenceDiagram
    participant User
    participant AI (e.g., agy / Claude)
    participant MCP Server (Local)
    participant VPS (Remote Server)
    
    User->>AI (e.g., agy / Claude): "Check the nginx logs on my VPS"
    AI (e.g., agy / Claude)->>MCP Server (Local): Call tool: execute_ssh_command
    Note over MCP Server (Local): Safely spawns SSH process
    MCP Server (Local)->>VPS (Remote Server): ssh user@host 'tail -n 50 /var/log/nginx/error.log'
    VPS (Remote Server)-->>MCP Server (Local): Returns logs
    MCP Server (Local)-->>AI (e.g., agy / Claude): Passes logs back to AI
    AI (e.g., agy / Claude)-->>User: "Here are the errors I found in your logs..."
```

## ✨ Features

- 💻 **`execute_ssh_command`**: Execute arbitrary bash commands on a remote VPS via SSH.
- 📤 **`scp_upload`**: Securely upload local files or directories to the remote server.
- 📥 **`scp_download`**: Download remote files from the server directly to your local machine.
- 🔒 **Secure by Design**: Built using `execFile` to prevent local shell injection vulnerabilities. Zero hardcoded passwords or IP addresses.

## ⚙️ Installation

First, clone and build the repository on your machine:

```bash
git clone https://github.com/MohamedCHAMI/mcp-server-vps-remote.git ~/mcp-server-vps-remote
cd ~/mcp-server-vps-remote
npm install
```

---

## 🤖 Supported Agents & Configuration

Because this tool is built on the universal **Model Context Protocol (MCP)**, it works seamlessly with a variety of AI coding assistants. Choose your preferred assistant below to see how to configure it.

### 1. Antigravity CLI (`agy`)
Antigravity allows global and project-level MCP configurations.
To configure globally, edit `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "vps-remote": {
      "command": "node",
      "args": ["/absolute/path/to/your/home/mcp-server-vps-remote/index.js"]
    }
  }
}
```

### 2. Claude Code CLI (`claude`)
Claude Code configures MCP servers in its global config file. 
Run `claude mcp add` in your terminal, or manually edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "vps-remote": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/your/home/mcp-server-vps-remote/index.js"]
    }
  }
}
```

### 3. Codex CLI
If your Codex setup supports MCP over stdio, add it to your configuration file (often located in `~/.codex/config.json`):

```json
{
  "mcpServers": {
    "vps-remote": {
      "command": "node",
      "args": ["/absolute/path/to/your/home/mcp-server-vps-remote/index.js"]
    }
  }
}
```

### 4. Cursor IDE
Cursor supports MCP servers natively inside the IDE settings.
1. Open Cursor Settings > Features > MCP.
2. Click **+ Add New MCP Server**.
3. Name it `vps-remote`.
4. Set the Type to `stdio`.
5. Set the Command to: `node /absolute/path/to/your/home/mcp-server-vps-remote/index.js`

### 5. Cline (VS Code Extension)
In VS Code, open the Cline configuration file by clicking the MCP icon in the sidebar and adding:

```json
{
  "mcpServers": {
    "vps-remote": {
      "command": "node",
      "args": ["/absolute/path/to/your/home/mcp-server-vps-remote/index.js"]
    }
  }
}
```

---

## 🛠️ Usage Examples

Once configured, simply speak naturally to your AI:

- 🔍 *"Can you check the docker logs on my VPS? My username is root and the IP is 192.168.1.10"*
- 🚀 *"Upload this newly generated build folder to my remote server at admin@example.com:/var/www/html"*
- 📄 *"Download the nginx configuration file from my remote server so we can analyze it locally."*

## 🛡️ Security & Authentication

This MCP server relies completely on your host system's native `ssh` and `scp` binaries. 

- **SSH Keys Required**: The server assumes you have SSH key-based authentication configured. It does not handle interactive password prompts. If your key requires a passphrase, ensure your `ssh-agent` is running.
- **No Stored Credentials**: The server does not store, cache, or hardcode any credentials, IPs, or usernames.
- **Zero Local Shell Injection**: Command arguments are passed directly to the binary execution layer, bypassing the local shell entirely.

## 📝 License

Released under the MIT License.
