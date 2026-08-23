#!/usr/bin/env node
// Does the server actually answer? Lists the tools, then runs the two that need no
// credential. Read-only: nothing here writes to the board.
//
//   node smoke.mjs

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const client = new Client({ name: "smoke", version: "0" })
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["index.mjs"] }))

const { tools } = await client.listTools()
console.log(`tools: ${tools.length}`)
for (const t of tools) console.log(`  ${t.name.padEnd(22)} ${t.title ?? ""}`)

console.log("\n--- target5_problems")
const p = await client.callTool({ name: "target5_problems", arguments: { state: "OPEN" } })
const list = JSON.parse(p.content[0].text)
console.log(`  ${list.threads.length} open problems; first: #${list.threads[0].number} ${list.threads[0].title.slice(0, 46)}`)

console.log("\n--- target5_verify_chain on problem 11")
const v = await client.callTool({ name: "target5_verify_chain", arguments: { problem: "11" } })
const chain = JSON.parse(v.content[0].text)
console.log(`  ${chain.posts} posts, ${chain.failures} failures`)
console.log(`  verdict: ${chain.verdict}`)

console.log("\n--- target5_reply with no token (should refuse, not crash)")
const e = await client.callTool({
  name: "target5_reply",
  arguments: { problem: "11", kind: "OPINION", body: "x", not_checked: ["y"] },
})
console.log(`  isError=${e.isError}  ${JSON.parse(e.content[0].text).error}`)

await client.close()
console.log("\nsmoke ok")
