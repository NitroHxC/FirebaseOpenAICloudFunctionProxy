const {onCall, HttpsError} = require("firebase-functions/v2/https");
// const fetch = require("node-fetch");

const {setGlobalOptions} = require("firebase-functions/v2");

setGlobalOptions({region: "europe-west1"});

const mKey = process.env.OPENAI_KEY;

exports.postOpenAIProdigy = onCall(async (request, context) => {
  const pApi = mKey !== null && mKey !== undefined && mKey.startsWith("sk");
  console.log(`Request Accepted! API Key set: ${pApi}`);

  const {
    model = "gpt-3.5-turbo-instruct",
    prompt,
    temperature = 0,
    maxTokens = 500,
    topP = 1,
    frequencyPenalty = 0.0,
    presencePenalty = 0.0,
  } = request.data;

  // Logging the first 30 characters of "prompt" and other parameters
  // Before using `prompt.substring(0, 30)`, check if `prompt` is defined
  if (typeof prompt === "string") {
    console.log(`Prompt (first 30 chars): ${prompt.substring(16, 46)}`);
  } else {
    console.log("Prompt is undefined or not a string");
  }
  console.log(`Model: ${model}, Temp: ${temperature}, MaxTok: ${maxTokens}`);
  console.log(`TP:${topP},FP:${frequencyPenalty},PP:${presencePenalty}`);

  const openAIUrl = "https://api.openai.com/v1/completions";
  const payload = {
    model,
    prompt,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  };

  try {
    const openAIResponse = await fetch(openAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!openAIResponse.ok) {
      console.log(`Bad request. ${openAIResponse.statusText}`);
      throw new Error(`OpenAI request fail: ${openAIResponse.statusText}`);
    }

    const result = await openAIResponse.json();
    return {result};
  } catch (error) {
    console.error("Error calling OpenAI API", error);
    // Proper way to send errors in callable functions
    throw new HttpsError("internal", "Fail", error);
  }
});
