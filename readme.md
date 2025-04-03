```terminal
perekladach-json translate -- -source=./file.json -from=en -to=uk -override=false -delay=500
```

#### Options

| Option         | Values                 | Description                                           |
|----------------|------------------------|-------------------------------------------------------|
| --f --from     | Language code(ISO 639) | Source language (e.g., en, uk)                        |
| --t --to       | Language code(ISO 639) | Target language (e.g., en, uk)                        |
| --s --source   |                        | Source file path (e.g., ./file.json)                  |
| --o --override | true of false          | Override existing translations (default: false)       |
| --d --delay    | 0 to 999999            | Delay between requests in milliseconds (default: 500) |
| --l --log      | info, verbose or none  | Log level (default: info)                             |

```dotenv
PEREKLADACH_OPENAI_API_KEY=""
```
