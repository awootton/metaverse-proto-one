
## This is the source code to the gotohere.com website 

Where I make demos and prototypes of ***Metaverse*** tech.
I am blogging all this crap on [X](https://x.com/alan_t_wootton)

You can run it locally (recommended). 

I forget the setup. It's like install 'node' and stuff. Make a folder and open a terminal to it.
Install git (lol having fun yet?) You know the drill, coders. Ask an AI.

Then:
```
git@github.com:awootton/metaverse-proto-one.git
```
cd into that directory and:
```
yarn start
```

Actually, don't do that. Be ambitious. Install VS-Code or something if you didn't yet. It won't bite. It's free, baby. 
From the terminal:
```
code .
```
and after VS-code comes up open a terminal and in THAT terminal:
```
yarn start
```
 
The gotohere.com website should just pop up in a browser.

You may contribute. Send me a PR. Fork the code etc. I'm a legit pro at this. 

Check back later. There's another project we can run that will develop properties (as in real estate, avatars and objects)

And, yes. For the record, I've gone insane. Not well at all. Doctors give me amazing drugs. Don't try this at home.

### Notes: major re-write. Perhaps I understood but ALL 
```index```
 props are being eliminated. So, no more 
 ```index={props.indexBase}```
Furthermore: ```key``` is NOT to sequence items in a list. It's better to uniquely identify a row in a column forever. We will not be using numbers for this when we have perfectly good id's for everything.
