"use strict";
const OpenAI = require("openai");
const dotenv = require("dotenv");
const cliProgress = require("cli-progress");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const cliProgress__namespace = /* @__PURE__ */ _interopNamespaceDefault(cliProgress);
function defineArgs() {
  const args2 = process.argv.slice(2);
  if (args2.length === 0) {
    console.error("No arguments provided.");
    process.exit(1);
  }
  const parsedArgs = {};
  args2.forEach((arg) => {
    if (!arg.startsWith("--") || !arg.includes("=")) return;
    const stripped = arg.replace(/^--/, "");
    const [keyRaw, rawValue = ""] = stripped.split("=");
    if (!keyRaw) return;
    const key = formatKey(keyRaw);
    parsedArgs[key] = formatValue(rawValue);
  });
  if (Object.keys(parsedArgs).length === 0) {
    console.error("No arguments passed.");
    process.exit(1);
  }
  if (!parsedArgs.from) {
    parsedArgs.from = "auto";
  }
  return parsedArgs;
}
function formatKey(key) {
  const shortKeys = {
    f: "from",
    t: "to",
    s: "source",
    o: "override",
    d: "delay",
    l: "log",
    h: "help"
  };
  return shortKeys[key] ?? key;
}
function formatValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value.includes(":")) {
    const obj = {};
    value.split(",").forEach((item) => {
      const [k, v] = item.split(":");
      if (k && v !== void 0) {
        obj[k.trim()] = v.trim();
      }
    });
    return obj;
  }
  if (value.includes(",")) {
    return value.split(",").map((item) => item.trim());
  }
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}
dotenv.config();
const openAiClient = new OpenAI({ apiKey: process.env.PEREKLADACH_OPENAI_API_KEY });
const translateOpenAi = async (text, to) => {
  var _a, _b;
  let usage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  };
  try {
    const chatCompletion = await openAiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Task: Translate "${text}" to language code: "${to}". Response format: Pure JSON {lang: ..., trans: ....}.`
            }
          ]
        }
      ]
    });
    let contentObject = {};
    const content = (_b = (_a = chatCompletion.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content;
    if (content) {
      let cleanContent = content.replace(/```json|```/g, "");
      contentObject = JSON.parse(cleanContent);
      if (!contentObject.lang || !contentObject.trans) {
        console.warn("Unexpected response format:", contentObject);
      }
      if (contentObject.lang && !/^[a-z]{2,3}(-[A-Z]{2})?$/.test(contentObject.lang)) {
        console.warn(`Invalid language code: ${contentObject.lang}`);
      }
    }
    return {
      ...contentObject,
      usage: chatCompletion.usage
    };
  } catch (error) {
    console.error(error);
    return {
      lang: to,
      trans: text,
      usage
    };
  }
};
async function translateSentence(sentence, to) {
  return await translateOpenAi(sentence, to);
}
const fs$1 = require("fs");
function readJson(filePath, silentErrors = false) {
  let jsonData = {};
  if (!fs$1.existsSync(filePath)) {
    if (!silentErrors) {
      console.error("File not found:", filePath);
    }
    return jsonData;
  }
  try {
    const data = fs$1.readFileSync(filePath, "utf8");
    jsonData = JSON.parse(data);
  } catch (err) {
    if (!silentErrors) {
      console.error("Error reading or parsing JSON file:", err);
    }
    return jsonData;
  }
  return jsonData;
}
function calcSentences(obj) {
  let count = 0;
  function recursiveCount(o) {
    for (let key in o) {
      if (typeof o[key] === "string") {
        count++;
      } else if (typeof o[key] === "object" && o[key] !== null) {
        recursiveCount(o[key]);
      }
    }
  }
  recursiveCount(obj);
  return count;
}
const cyan = "\x1B[36m";
const reset = "\x1B[0m";
let languageIndex = 0;
let bars = [];
let total = 0;
let translated = 0;
let skipped = 0;
let failed = 0;
let completionTokens = 0;
let totalTokens = 0;
async function translateJsonObject(fileArgs, sourceTranslations, targetTranslation) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const isOverride = fileArgs["override"];
  const log = fileArgs["log"] ?? "info";
  for (const [key, value] of Object.entries(sourceTranslations)) {
    if (typeof value === "object" && value !== null) {
      if (!targetTranslation[key]) {
        targetTranslation[key] = {};
      }
      await translateJsonObject(fileArgs, value, targetTranslation[key]);
    } else {
      if (!isOverride && targetTranslation[key] !== void 0) {
        if (log === "verbose") {
          console.info(`[${translated}/${total}] Skipping ${key}`);
        }
        translated++;
        skipped++;
        continue;
      }
      const translation = await translateSentence(value, fileArgs["to"]);
      if (log === "verbose") {
        console.info(`[${translated}/${total}] Translated ${key}: ${translation.trans}, Prompt Tokens: ${((_a = translation == null ? void 0 : translation.usage) == null ? void 0 : _a.prompt_tokens) ?? 0}, Completion Tokens: ${((_b = translation == null ? void 0 : translation.usage) == null ? void 0 : _b.completion_tokens) ?? 0}, Total Tokens: ${((_c = translation == null ? void 0 : translation.usage) == null ? void 0 : _c.total_tokens) ?? 0}`);
      }
      if (translation.trans === "") {
        console.warn(`[${translated}/${total}] Failed to translate ${key}`);
        failed++;
      }
      translated++;
      ((_d = translation == null ? void 0 : translation.usage) == null ? void 0 : _d.prompt_tokens) ?? 0;
      completionTokens += ((_e = translation == null ? void 0 : translation.usage) == null ? void 0 : _e.completion_tokens) ?? 0;
      totalTokens += ((_f = translation == null ? void 0 : translation.usage) == null ? void 0 : _f.total_tokens) ?? 0;
      bars[languageIndex].update(
        translated,
        {
          skipped,
          failed,
          promptTokens: ((_g = translation == null ? void 0 : translation.usage) == null ? void 0 : _g.prompt_tokens) ?? 0,
          completionTokens: ((_h = translation == null ? void 0 : translation.usage) == null ? void 0 : _h.completion_tokens) ?? 0,
          totalTokens: ((_i = translation == null ? void 0 : translation.usage) == null ? void 0 : _i.total_tokens) ?? 0
        }
      );
      await new Promise((resolve) => setTimeout(resolve, fileArgs["delay"] ?? 500));
    }
  }
}
async function translateFile(fileArgs) {
  const isOverride = fileArgs["override"];
  const sourceTranslations = readJson(fileArgs.source);
  const targetTranslation = readJson(fileArgs.dest, !isOverride);
  if (sourceTranslations === null) {
    return null;
  }
  total = calcSentences(sourceTranslations);
  bars[languageIndex] = new cliProgress__namespace.SingleBar(
    {
      format: `${fileArgs["to"]} |${cyan}{bar}${reset}| {percentage}% || {value}/{total} sentences translated | {skipped} skipped | {failed} failed | Prompt: {promptTokens} | Completion: {completionTokens} | Total: {totalTokens}`,
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true
    }
  );
  bars[languageIndex].start(
    total,
    0,
    {
      skipped: 0,
      failed: 0
    }
  );
  await translateJsonObject(fileArgs, sourceTranslations, targetTranslation);
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }
  bars[languageIndex].stop();
  languageIndex++;
  return targetTranslation;
}
const fs = require("fs");
function writeJson(object, dest) {
  if (object === null) {
    console.error("Failed to translate the file");
    process.exit(1);
  }
  if (Object.keys(object).length === 0) {
    console.warn("No translations were added");
    process.exit(0);
  }
  try {
    const jsonString = JSON.stringify(object, null, 2);
    fs.writeFileSync(dest, jsonString, "utf8");
  } catch (e) {
    console.error("Error writing JSON file:", e);
  }
}
function definePaths(from, to, sourcePath) {
  if (from) {
    return sourcePath.replace(from, to);
  }
  if (sourcePath.includes("/")) {
    return sourcePath.replace(/\/[^/]*$/, `/${to}.json`);
  }
  return `${to}.json`;
}
async function translateQueue(args2) {
  const queue = args2["to"] !== void 0 ? typeof args2["to"] === "string" ? [args2["to"]] : args2["to"] : [];
  const from = args2["from"] ?? "auto";
  const source = args2["source"] ?? "";
  const override = args2["override"] ?? false;
  const delay = args2["delay"] ?? 500;
  const log = args2["log"] ?? "info";
  for (const to of queue) {
    if (log === "verbose") {
      console.info(`Start translating to ${to}`);
    }
    const dest = definePaths(from, to, source);
    const targetTranslation = await translateFile({
      to,
      source,
      dest,
      override,
      delay,
      log
    });
    if (targetTranslation) {
      writeJson(targetTranslation, dest);
    }
    if (log === "verbose") {
      console.info(`End translating to ${to}`);
    }
  }
}
const args = defineArgs();
translateQueue(args).then(() => {
  const log = args["log"] ?? "info";
  if (!log || log !== "none") {
    console.info("");
    console.info("Translation completed successfully");
  }
});
