### OpenAI Firebase Cloud Function

To init a new repo
```
firebase init
```

select the Cloud Functions option with spacebar, then select Javascript as language

The `index.js` file in the `functions` folder is all you need. 
It contains the callback for an Https Call you can make from the Firebase SDK. 

*BEWARE*: `onCall` is for use with Firebase SDK, and is is different from `onRequest` which is the callback for an HTTP request.

To deploy the function to firebase, run the following command in the terminal:
```
firebase deploy --only functions
```

Once it is deployed, you can update it by setting the OpenAI API Key as an environment variable
```
gcloud functions deploy postOpenAIProdigy --set-env-vars OPENAI_KEY="sk-<your openAI key here>" --region=europe-west1 --runtime=nodejs20
```