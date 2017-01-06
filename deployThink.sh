#!/bin/bash

# © Copyright IBM Corp. 2016
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.



# Set Bluemix API Endpoint. You will need this change this if your account use differnt default api endpoint
cf login -a https://api.ng.bluemix.net

# create service
cf create-service cloudantNoSQLDB Lite Humix-Cloudant-Service
cf create-service conversation standard Humix-Conversation-Service
cf create-service speech_to_text standard Humix-Speech-Service
#cf create-service text_to_speech standard Humix-TTS-Service

# deploy application
cf push
