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
    const usage = chatCompletion.usage || {};
    return {
      ...contentObject,
      usage
    };
  } catch (error) {
    console.error(error);
    return {
      lang: to,
      trans: text,
      usage: {}
    };
  }
};
async function translateSentence(sentence, to) {
  const responseString = await translateOpenAi(sentence, to);
  try {
    const responseJson = JSON.parse(responseString);
    const lang = responseJson.lang ?? null;
    const translation = responseJson.trans ?? null;
    if (lang === to && translation !== null) {
      return translation;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
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
let languageIndex = 0;
let bars = [];
let total = 0;
let translated = 0;
let skipped = 0;
let failed = 0;
async function translateJsonObject(fileArgs, sourceTranslations, targetTranslation) {
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
      bars[languageIndex].increment();
      if (translation === null) {
        console.warn(`[${translated}/${total}] Failed to translate ${key}`);
        translated++;
        failed++;
        continue;
      }
      targetTranslation[key] = translation;
      if (log === "verbose") {
        console.info(`[${translated}/${total}] Translated ${key}: ${translation}`);
      }
      translated++;
      await new Promise((resolve) => setTimeout(resolve, fileArgs["delay"] ?? 500));
    }
  }
}
async function translateFile(fileArgs) {
  const isOverride = fileArgs["override"];
  const log = fileArgs["log"] ?? "info";
  const sourceTranslations = readJson(fileArgs.source);
  const targetTranslation = readJson(fileArgs.dest, !isOverride);
  if (sourceTranslations === null) {
    return null;
  }
  total = calcSentences(sourceTranslations);
  bars[languageIndex] = new cliProgress__namespace.SingleBar({}, cliProgress__namespace.Presets.shades_classic);
  bars[languageIndex].start(total, 0);
  await translateJsonObject(fileArgs, sourceTranslations, targetTranslation);
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }
  if (!log || log !== "none") {
    console.info(`${fileArgs.to}: Translated ${translated} sentences with ${skipped} skipped and ${failed} failed`);
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
    console.info("Translation completed successfully");
  }
});
