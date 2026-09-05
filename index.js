import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { execFile } from "child_process";
import util from "util";

const execFileAsync = util.promisify(execFile);

const server = new Server(
  { name: "vps-remote-mcp", version: "1.0.1" },
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
      // Using execFile avoids local shell injection vulnerabilities
      const { stdout, stderr } = await execFileAsync("ssh", [`${user}@${host}`, command], { timeout: 60000 });
      return {
        content: [{ type: "text", text: `STDOUT:\n${stdout}\nSTDERR:\n${stderr}` }],
      };
    } 
    else if (name === "scp_upload") {
      const { user, host, local_path, remote_path } = args;
      const { stdout, stderr } = await execFileAsync("scp", [local_path, `${user}@${host}:${remote_path}`], { timeout: 60000 });
      return {
        content: [{ type: "text", text: `Upload successful.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}` }],
      };
    }
    else if (name === "scp_download") {
      const { user, host, remote_path, local_path } = args;
      const { stdout, stderr } = await execFileAsync("scp", [`${user}@${host}:${remote_path}`, local_path], { timeout: 60000 });
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
