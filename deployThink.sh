#!/bin/bash

# Set Bluemix API Endpoint. You will need this change this if your account use differnt default api endpoint
cf login -a https://api.ng.bluemix.net

# create service
cf create-service cloudantNoSQLDB Shared Humix-Cloudant-Service
cf create-service conversation standard Humix-Conversation-Service
cf create-service speech_to_text standard Humix-Speech-Service
#cf create-service text_to_speech standard Humix-TTS-Service

# deploy application

cf push
