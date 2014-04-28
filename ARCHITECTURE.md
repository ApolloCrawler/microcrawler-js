# Architecture

## Messaging Endpoints

 - /queue - Enqueue new request here
   - Consumes requests for new downloads/fetches to be enqueued
 - /fetch
   - Consumers commands for downloading fetching data
 - /data
   -