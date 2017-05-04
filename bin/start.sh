#!/bin/bash

redis-server --dir /data --appendonly yes & 
npm start
