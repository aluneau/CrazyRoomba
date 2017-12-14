# Documentation projet CrazyRoomba
## Présentation du projet
Le projet CrazyRoomba est un projet permettant de transformer la plateforme iCreate (v1) de iRobot en un robot compagnion connecté. Nous avons également intégré un système permettant de récuperer la position du robot par rapport à sa position de départ.<br/>
Le système repose entièrement sur le protocol MQTT pour l'échange des données entre les differentes partis du projet et possiblement avec d'autres objets connectés.

## Le matériel utilisé
Le projet repose en plus de la plateforme iCreate sur un raspberry pi pour gerer la récuperation et l'envoie de données au robot. Il utilise également une tablette pour permettre un affichage directement sur le robot ainsi que la récupération de l'angle (l'angle donné par la plateforme iCreate n'étant pas assez précis).<br/>
Pour ce projet le matériel qui a été utilisé est exactement:
<ul>
<li>Gigabyte Tegra note 7</li>
<li>Raspberry Pi 3 sous Raspbian</li>
<li>Plateforme robotique iRobot iCreate 1</li>
<li>PowerBank pour l'alimentation de la tablette et du Pi</li>
</ul>

# Logiciel et frameworks utilisés
## Logiciels
### emqtt.io
Le projet est conçu autour du protocol MQTT. Pour le faire fonctionner il vous faudra donc un broker MQTT fonctionnel. Nous avons fait le choix de <a href="http://emqtt.io/">emqtt.io</a> qui est un broker écrit en erLang et permet d'effectuer une infrastructure distribué très facilement. Il permet de gerer 4000 messages par secondes en entré et 20000 messages par secondes en sortie par noeuds (<a href="https://github.com/emqtt/emqttd/wiki/benchmark-for-0.13.0-release">sources</a>). Il implémente le protocol MQTT V3.1.1 supporte à la fois une connection directement via le protocol MQTT(port 1083 par défaut) ou via Websocket (port 8083 par défaut).

## Frameworks et libraries
### Framework
Le projet se base principalement sur le framework <b>Angular</b>. Il a donc été développer principalement en typeScript. Nous avons également utilisé nodeJs pour la parti serveur se trouvant sur le raspberry pi.
### Libraries
<ul>
<li>MQTTjs</li>
<li>Serialport (pour nodeJS)</li>
</ul>

## Découpage du projet
Grâce a sa conception autour du protocol MQTT nous avons pu découper facilement l'ensemble notre projet en plusieurs application.
<img src="imgdoc/img1.png"/>
### Les trois grandes partis de l'application sont:
#### Application Server.js
C'est l'application qui va communiquer directement avec le robot. C'est elle qui va récuperer les différentes données des capteurs. Elle va également envoyer des commandes au robot. Elle utilise la librairie serialport.

#### Apllication RoombaAPP
C'est l'application qui tourne sur un client web. Elle se connecte à l'application Server.js via le broker MQTT.
#### Application PointsAPP
C'est l'application qui permet la localisation aproximative du robot en fonction de son point de départ.

#### Application TabletAPP
C'est l'application qui tourne sur la tablette associé au robot. Elle permet d'envoyer l'angle à l'application PointsAPP et également un affichage sur le robot.

## Organisation des dossiers
`/` contiens tout les fichiers concernant le serveur notamment le point d'entré: `server.js` <br/>
`config`contiens le fichier de configuration <br/>
`pointsApp`contiens l'application PointsApp <br/>
`roomba-app`contiens l'application Angular RoombaAPP
