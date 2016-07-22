#!/bin/bash

cf login

# create service
cf create-service cloudantNoSQLDB Shared Humix-Cloudant-Service
cf create-service conversation standard Humix-Conversation-Service
cf create-service speech_to_text standard Humix-Speech-Service
#cf create-service text_to_speech standard Humix-TTS-Service

# deploy application

cf push
