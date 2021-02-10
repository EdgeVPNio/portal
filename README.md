# Evio Visualizer Portal

Web portal for network administration and visualization

## Steps to Run

You can run the application using the following commands:

* Setup the required infrastructure using the setup script using:

    <pre><code>./setup.sh</code></pre>

    It will ask you standard questions required to setup an npm project.

* Make sure to set the environment variables for the application by editing the **.env** file.

* Start the server by running the below command:
    <pre><code>node ./server/Server.js</code></pre>

## Changes required in the Evio config

To redirect the Evio node information to the above visualizer application, add the below configuration to the Evio **config.json** file.

<pre> <code>
  "OverlayVisualizer": {
    "Enabled": true,
    "TimerInterval": 30,
    "WebServiceAddress": "*.*.*.*:*",
    "NodeName": "nd-###"
  },
</code></pre>

Change the IP and the port to where your visualizer is running.

## Software Stack Used

* MongoDB
* Node.js
* Express.js
* React.js

