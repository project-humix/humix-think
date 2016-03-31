#!/bin/bash

cf login

# create service
cf create-service cloudantNoSQLDB Shared Humix-Cloudant-Service
cf create-service dialog standard Humix-Dialog-Service
cf create-service natural_language_classifier standard Humix-NLC-Service
cf create-service speech_to_text standard Humix-Speech-Service

# deploy application

cf push
