#!/bin/sh

redis-server --dir /data --appendonly yes & 
npm start
