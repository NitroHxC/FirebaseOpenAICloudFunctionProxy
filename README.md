### OpenAI Firebase Cloud Function

To deploy the function to firebase, run the following command in the terminal:
```
firebase deploy --only functions
```

Once it is deployed, you can set the OpenAI API Key as an environment variable
```
gcloud functions deploy postOpenAIProdigy --set-env-vars OPENAI_KEY="sk-<your openAI key here>" --region=europe-west1 --runtime=nodejs20
```