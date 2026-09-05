import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

const server = new Server(
  { name: "vps-remote-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_ssh_command",
        description: "Executes a bash command on a remote VPS via SSH. Assumes SSH keys are configured.",
        inputSchema: {
          type: "object",
          properties: {
            user: { type: "string", description: "SSH username (e.g., root)" },
            host: { type: "string", description: "VPS hostname or IP address" },
            command: { type: "string", description: "The bash command to execute remotely" },
          },
          required: ["user", "host", "command"],
        },
      },
      {
        name: "scp_upload",
        description: "Uploads a local file to the remote VPS using SCP.",
        inputSchema: {
          type: "object",
          properties: {
            user: { type: "string" },
            host: { type: "string" },
            local_path: { type: "string", description: "Absolute path to local file" },
            remote_path: { type: "string", description: "Absolute destination path on VPS" },
          },
          required: ["user", "host", "local_path", "remote_path"],
        },
      },
      {
        name: "scp_download",
        description: "Downloads a file from the remote VPS to the local machine using SCP.",
        inputSchema: {
          type: "object",
          properties: {
            user: { type: "string" },
            host: { type: "string" },
            remote_path: { type: "string", description: "Absolute path on the VPS" },
            local_path: { type: "string", description: "Absolute destination path locally" },
          },
          required: ["user", "host", "remote_path", "local_path"],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === "execute_ssh_command") {
      const { user, host, command } = args;
      // We escape double quotes to safely pass the command, though simpler is just to single quote the whole thing.
      // Easiest robust way without heavy escaping logic is to pass it base64 encoded and decode it on the remote side,
      // but let's try direct first.
      const escapedCmd = command.replace(/'/g, "'\\''");
      const sshCommand = `ssh ${user}@${host} '${escapedCmd}'`;
      
      const { stdout, stderr } = await execAsync(sshCommand, { timeout: 60000 });
      return {
        content: [{ type: "text", text: `STDOUT:\n${stdout}\nSTDERR:\n${stderr}` }],
      };
    } 
    else if (name === "scp_upload") {
      const { user, host, local_path, remote_path } = args;
      const cmd = `scp "${local_path}" ${user}@${host}:"${remote_path}"`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });
      return {
        content: [{ type: "text", text: `Upload successful.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}` }],
      };
    }
    else if (name === "scp_download") {
      const { user, host, remote_path, local_path } = args;
      const cmd = `scp ${user}@${host}:"${remote_path}" "${local_path}"`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });
      return {
        content: [{ type: "text", text: `Download successful.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}` }],
      };
    }
    else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}\n${error.stderr || ''}` }],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VPS Remote MCP Server running on stdio");
}

run().catch(console.error);
