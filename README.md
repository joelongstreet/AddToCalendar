# Add to Calendar

A little node app/chrome plugin I made for my wife. It helps her transfer a work schedule from web app to gmail calendar via a button on the Chrome browser.

## Sample 
`curl -d'[{"start_time" : "20120925T190000Z", "end_time" : "20120925T200000Z", "description" : "Some Description","summary" : "Some Summary", "location" : "Some Location"}]' -H 'content-type:application/json' "http://joe.local:3001"`