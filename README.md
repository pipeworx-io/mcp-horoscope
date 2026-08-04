# mcp-horoscope

Horoscope MCP — wraps the keyless Horoscope App API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `daily_horoscope` | Get the daily horoscope for a zodiac sign. Returns the prediction text for a given day (today, tomorrow, yesterday, or a specific YYYY-MM-DD date). Useful for "what is my horoscope today" style questions. |
| `weekly_horoscope` | Get the weekly horoscope for a zodiac sign. Returns the prediction text covering the current week. |
| `monthly_horoscope` | Get the monthly horoscope for a zodiac sign. Returns the prediction text for the current month plus challenging and standout days. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "horoscope": {
      "url": "https://gateway.pipeworx.io/horoscope/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Horoscope data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
