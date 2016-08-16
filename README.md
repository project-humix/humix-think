# Overview

`Humix` is an open source robot connectivity and design framework that make it easy to
bridge cloud API with hardware sensors and devices. Combining with Watson APIs,
the framework help everyone to build their own cloud-brained robot with a few minimal steps.

Humix leverages NodeRed as the flow-editor for designing how the robot behaves. On top of NodeRed,
a few new nodes are added to support Humix’s module programming model, and make it relatively easy for 
the cloud brain to interact with modules deployed on the robot. 


#Architecture

Essentially, Humix consists of two major components - Humix Think and Humix Sense.
`Humix Think` is the cloud-side component that embeds a NodeRed flow editor for design robot behaviour.
`Humix Sense`, on the other hand, is located on the device that acting as a robot.
Humix Sense use `NATS` as local messaging framework for all registered Humix Modules
to send sensor events and receive the commands. Humix Sense would monitor the local messaging bus
and deliver the messages to cloud for further processing.
With Humix Sense, each module could focus on its own logic without worrying about how messages
are routed to Humix Think. This micro service architecture make Humix an extensible
module systems that could be enhanced incrementally.

Currently the core Humix module that comes with Humix framework is ‘humix-dialog-module’.
This module use speech-recognition and text-to-speech engines  to support basic interaction with robot. Find more information about humix-dialog-module [here](https://github.com/project-humix/humix-dialog-module).



# Hardware Requirement

Here we use RaspberryPi as reference development board for robot, but any device that can run Node.js 4.2.x+ would do.

    1. Raspberry Pi/Pi2/Pi3
    2. Micro SD (8G+)
    3. USB Sound Card
    4. Microphone
    5. Speaker
    6. PL2303HXD USB To TTL Serial Cable (Optional. This is for login raspberry pi.)


# Setup Humix Think


## 1. Create your bluemix account

If you don't have bluemix account, you can follow the steps in this [link](https://www.ibm.com/developerworks/cloud/library/cl-bluemix-fundamentals-start-your-free-trial/) to create one.


Once login, set your region to US South ( Notes : if your account was created at different region, you should set appropriate api endpoint during cf login) :

<img border="0" height="280" src="https://1.bp.blogspot.com/-wnsU8Sj6xyI/Vw81z3pRSlI/AAAAAAAAABs/PtqygkrMWAowDsHq5ZqtZ5cmM_WLuc7-gCLcB/s1600/IBM%2BBluemix%2B-region2.png" width="400" />

## 2. Deploy Humix Think

You can run Humix Think either on bluemix or run it locally. First, clone the repository to your local machine

```
    git clone https://github.com/project-humix/humix-think.git
```

### Deploy on bluemix

The first step is to pick a name for your application. So enter the think directory and modify the manifest.xml

```
    vim manifest.yml
```

Update the `name` and `host` properties. Make sure the name is available on bluemix, otherwise the process will fail when trying to deploy on bluemix.

example manifest.yml : <br>
```
applications:
- path: .
      memory: 512M
      instances: 1
      domain: mybluemix.net
      name: humix-demo
      host: humix-demo
      disk_quota: 1024M
      services:
      - Humix-Cloudant-Service
      - Humix-NLC-Service
      - Humix-Speech-Service
      command: node --max-old-space-size=384 app.js --settings ./bluemix-settings.js -v
 ```

 ** Note : Only the 'Humix-Cloudant-Service' is mandatory. You can comment out other services (e.g "Humix-NLC-Service") if you don't want to use these services for designing the conversation.

 #### install cf client

 You will need cf client to push the application into bluemix. If you don't cf-client install, you can get it [here](https://github.com/cloudfoundry/cli)

 #### Push application to bluemix

 Next, let's deploy the humix think to blueimx. Here we will run a script that automatically create associated services needed and bind them to humix think. The script will also deploy the humix think on bluemix.

```
     ./deployThink.sh
```
** Notes : if you commented out some services in manifest.xml, remove services in this script as well.  

Ff everything works well, you can find your application in the following link (change your application name)

__http://< your_app_name >.mybluemix.net__

<img border="0" height="280" src="https://3.bp.blogspot.com/-ntpV9i7u44g/VxEyXVlCufI/AAAAAAAAAG4/dSGYiqs_ZGIpSqAPBB2aHZlZyt9NkjKgwCLcB/s1600/humix-pi2-addsense.png" width="400" />



### Deploy Locally

Alternatively, you can run humix think locally. Since Humix Think depends a couchdb storage, 
you can either install one locally ( do `brew install couchdb` on Mac and `apt-get install couchdb` on Ubuntu Linux), or provide a cloudant db url from your cloudant service on bluemix.

After you have local couchdb running, edit humix-settings.js and change the location from 'bluemix' to 'local'. 

example config:
```
var humix_settings = module.exports = {

    // 'local' or 'bluemix'
    location : 'local',

    storage : 'couch',

    storageURL : 'http://127.0.0.1:5984/'
};

```



Then install dependencies and build humix-think
```
    cd humix-think
    npm install
    npm start
```

Then you can visit your local `humix think` via http://localhost:3000



For steps required to setup `humix sense`, please refer to [here](https://github.com/project-humix/humix-sense)


# Copyright and License

Copyright 2016 IBM Corp. Under the Apache 2.0 license.
