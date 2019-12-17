Installation Guide for PAI BOT (Node JS)
========================================

In this guide we will install PAI Bot on your machine and register the Bot to the PAI-NET.

By the end of this guide you will have a PAI Bot running and ready to work on your machine.

> This guide is for linux based OS - (macOS and Ubuntu 16.04+ tested). You can find Windows based OS in {here - PAI Bot windows installation guide}


In order to prepare the operating system for the PAI Bot, we need to set up PAI Environment first. (Read more about {PAI Environment})


Ok, after setting up the PAI Env, we can start installing the Bot with the following steps:
* Install Prerequisite
* Download PAI Bot Repository
* Initiating the Bot and register the Bot to PAI-NET
* Communicating with the Bot via PAI Console
* Running the bot in the background

So - lets start:

#### 1. Install Prerequisite
---------------------------------

We are going to install the following programs:
* Git
* Node Js
* npm
* pm2 - npm package to run the Bot in the background

> If you are using Docker - You can use our Docker image <a href="https://hub.docker.com/r/paitech/pai-naked-node">Here</a> and skip to step 2.

Open the terminal on your machine and type the following script:
```
 #Git installation
 sudo apt-get install git

 #Node Js installation inc. Npm
 curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
 apt-get update | apt-get install -qq -y nodejs
 #Update Npm
 npm install -g npm

 #Pm2 installation
 npm install -g pm2
 #Set Pm2 to start when system restart
 pm2 startup
```

If all installation proccess finished with success, you should be able to run the following commands to check them:

```
git --version

node -v

npm -v

pm2 status
```

If Prerequisite are all set, we can now download the Bot repository from Github.

#### 2. Download PAI Bot Repository
---------------------------------

Open the terminal on your machine and go to the folder where you want to install the Bot's repository:
```
cd /var/PAI/Bot  # You can set any location with access to the PAI Environment
```

Clone the PAI-BOT-JS repository from GitHub:
```
git clone https://github.com/PAI-Tech/PAI-BOT-JS.git
```

After the download has finished, run the npm install command to install all remote packages
```
npm install
```


#### 3. Initiating the Bot and register the Bot to PAI-NET
---------------------------------

> Please make sure you have PAI Account for PAI-NET registration. You will not be able to learn any modules without    registering to PAI-NET.
for more information go to {PAI Net Registration link}

In order to create the Bot - run the following command in the terminal:
```
npm run init
```

Here you will need to configure the bot, please fill the information like the description below:
```
init script:
2018-12-26T22:00:31.630Z    [info]:  loading module pai-code
2018-12-26T22:00:32.208Z    [info]:  loading module pai-os
2018-12-26T22:00:32.209Z    [info]:  loading module pai-net
2018-12-26T22:00:32.218Z    [info]:  loading module pai-bot
2018-12-26T22:00:32.223Z    [info]:  loading module pai-scheduler
No bots found, would you like to create one ? (yes)     yes       <----------
Please enter PAI-NET url: (https://console.pai-net.org)     <----------
2018-12-26T22:00:37.610Z    [info]:  true
Please enter PAI-NET username:     {Your username(email) to PAI-NET}    <----------
Please enter PAI-NET password:     {Your Password}        <----------

login success
Please enter Bot's nickname:      Your Bot Name  <----------
bot created: Your Bot Name
Bot created successfully !
Bot token is now active :)
```


Ok now that the Bot is all set lets run it:
```
npm start
```

If it echo the results below the bot is ready and live !
```
> npm start

2018-12-26T22:09:18.306Z    [info]:  loading module pai-code
2018-12-26T22:09:19.136Z    [info]:  loading module pai-os
2018-12-26T22:09:19.138Z    [info]:  loading module pai-net
2018-12-26T22:09:23.429Z    [info]:  token is now active
2018-12-26T22:09:23.432Z    [info]:  loading module pai-bot
2018-12-26T22:09:23.432Z    [info]:  loading module pai-scheduler
2018-12-26T22:09:23.452Z    [info]:  pai-code version 1.1.48
PAI-NET Socket connected to server       <------
2018-12-26T22:09:33.987Z    [info]:  token is now active   <------
login success
2018-12-26T22:09:33.987Z    [info]:  true
2018-12-26T22:09:33.988Z    [info]:  Running Connector -> FILE
2018-12-26T22:09:33.992Z    [info]:  Running Connector -> HTTP
2018-12-26T22:09:34.004Z    [info]:  Additional files to load: []
```

#### 4. Communicating with the Bot via PAI Console
---------------------------------

You can communicate with your Bot via the PAI Console.

 4.1 Go to https://console.pai-net.org and login to your account.

> In case you registered your bot to a different PAI-NET, type your PAI-NET url.

 4.2 Go to > My Bots (on the left bar) - you will see your bot is live and active.

 4.3 Click on the Bot and start communicating with it!

// TODO: console communication guide

#### 5. Running the bot in the background
---------------------------------

If you want to run your bot in the background while as such you can close the terminal window,

you can run it with Node deployment package, such as _pm2_.

Just run pm2 start command on your terminal:
```
#To run in the background & save the proccess
pm2 start PAI.js --name $BOT_NAME --watch
pm2 save

#Install log-rotate for the log file (optional)
pm2 install pm2-logrotate
```

