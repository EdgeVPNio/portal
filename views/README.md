## **Getting started**

Prereq : Run setup.sh


Instructions for running the views folder [React standalone] : 

Start the server/Server.js code with modification to not call index.html from ui folder as shown below:
```
app.get('/', (req, res) => {
  res.sendFile(path + "index.html");//loads the react UI
});

To

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Visualizer application." });
});
```

Change the configured port at config.js @views/src to anything other than 3000 [As server is running on 3000]

Run :
```
npm start
```
a landing page will show up on your browser. Any change to views folder, run "npm start" to compile and test.