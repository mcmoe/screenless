### Using Mozilla TTS at https://github.com/mozilla/TTS  

* /!\ No SSML support so far  
* Installed the docker image and started using it 
	* https://github.com/synesthesiam/docker-mozillatts
    * ```sh
      docker run -it -p 5002:5002 -d --name moztts-en synesthesiam/mozillatts:en
      ```
	* ``` sh
      curl -G --output - \
          --data-urlencode 'text=Do or do not there is no try' \
          'http://localhost:5002/api/tts' | \
          aplay
	  ```
* supports en and fr (+ es and de)
* /!\ careful with punctuation, I ran into a weird bug :) to test further
* should be able to integrate this into `gsoundof` game for example or hands 
 
### Google Cloud T2S service  
* For a better experience and more languages  
* Pricing - wavenet model, first 1M characters a month are free then it's 15 EUR/1M  
* Sign up for the 300$ credit over the next 90 days
    * https://cloud.google.com/text-to-speech/docs/reference/rest/?apix=true  
* Samples on how to start using it in Node.js  
    * https://cloud.google.com/text-to-speech/docs/samples/tts-synthesize-text#tts_synthesize_text-nodejs  
