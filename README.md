### OpenAI Firebase Cloud Function

To init a new repo
```
firebase init
```

select the Cloud Functions option using the spacebar in the interactive prompt, then select Javascript as language

The `index.js` file in the `functions` folder is all you need. 
It contains the callback for an Https Call you can trigger from the Firebase SDK. 

*BEWARE*: `onCall` is for use with Firebase SDK, and is different from `onRequest` which is the callback for an HTTP request.

In this repo the function is called `postOpenAIProdigy` because I used it for an app I made called `Prodigy` , and I deployed it to the `europe-west1` region.

To deploy your function to firebase, run the following command in the terminal:
```
firebase deploy --only functions
```

Once it is deployed, you can update it by setting the OpenAI API Key as an environment variable
```
gcloud functions deploy postOpenAIProdigy --set-env-vars OPENAI_KEY="sk-<your openAI key here>" --region=europe-west1 --runtime=nodejs20
```

### Example Kotlin:

Put this in a ViewModel and use it for one-shot calls to ChatGPT API. 
You can use the `textResponse` LiveData to observe the result in your UI.

```kotlin:ChatGPTViewModel.kt
val textResponse = MutableLiveData<String>()

suspend fun callOpenAI(query: String) = viewModelScope.launch {
    val functions = Firebase.functions("europe-west1")

    val dataOut = hashMapOf(
        "prompt" to "${query}",
        "model" to "gpt-3.5-turbo-instruct",
        "temperature" to 0,
        "max_tokens" to 500,
        "top_p" to 1,
        "frequency_penalty" to 0.0,
        "presence_penalty" to 0.0
    )

    try {
        val result = functions
            .getHttpsCallable("postOpenAIProdigy")
            .call(dataOut)
            .addOnSuccessListener { result ->
                // Handle success
                Log.i("Firebase", "SUCCESS")
            }
            .addOnFailureListener { e ->
                // Handle error
                Log.i("Firebase", "FAILURE: ${e.message}")
            }
            .await() // Use .await() for suspending function call

        val responseJson = gson.toJson(result.data)
        val openAIResponse = gson.fromJson(responseJson, FirebaseOpenAIResponse::class.java)

        // Now you can access the usage and text like this:
        val usage = openAIResponse.result.usage
        Log.i("ChatGPT", "Completion tokens: ${usage.completion_tokens}, Prompt tokens: ${usage.prompt_tokens}, Total tokens: ${usage.total_tokens}")

        val text = if (openAIResponse.result.choices.isNotEmpty()) {
            openAIResponse.result.choices.first().text
        } else {
            "No text available"
        }

        Log.i("ChatGPT", "Text Content: ${text.toString()}")

        // Set the Result in the textResponse LiveData
        textResponse.value = text.trimStart()
    } catch (e: Exception) {
        Log.e("ChatGPT", "${e.message}")
    }
}
```

You should declare the proper the following data classes to parse with Gson:

```
data class FirebaseOpenAIResponse(
    val result: FirebaseResult
)

data class FirebaseResult(
    val usage: Usage,
    val choices: List<Choice>
)

data class Usage(
    val completion_tokens: Int,
    val prompt_tokens: Int,
    val total_tokens: Int
)

data class Choice(
    val text: String
)
```
