# Snow Bot


## Usage

1. Add bot to your server : `https://discordapp.com/oauth2/authorize?client_id=<Bot_Client_ID>&scope=bot&permissions=0`

Replace `Bot_Client_ID` by real clientID.

2. Create a `.env` file

It must contain following line : `DISCORD_BOT_SECRET=YOUR-TOKEN`

3. Command

`!snow` or `!snow all` trigger all endpoints and return following snow traffic light states

`!snow <name>` trigger specific snow traffic light state

`!ping` check bot is still online/available


## endpoint example

Add endpoint to endpoint.json. Endpoints can have following looks.

> https://carte.ville.quebec.qc.ca/ArcGIS/rest/services/CI/OperationDeneigement/MapServer/1/query?f=json&where=&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22:249093,%22ymin%22:5186474,%22xmax%22:249133,%22ymax%22:5186514,%22spatialReference%22:%7B%22wkid%22:32187%7D%7D&geometryType=esriGeometryEnvelope&inSR=32187&outFields=STATION_NO,STATUT,DEBUT,FIN,DateMiseJour,STATIONNEMENT&outSR=32187


> https://carte.ville.quebec.qc.ca/ArcGIS/rest/services/CI/OperationDeneigement/MapServer/1/query?f=json&where=&geometry=%7B%22xmin%22:249093,%22ymin%22:5186474,%22xmax%22:249133,%22ymax%22:5186514,%22spatialReference%22:%7B%22wkid%22:32187%7D%7D&outFields=STATION_NO,STATUT,DEBUT,FIN,DateMiseJour,STATIONNEMENT

> https://carte.ville.quebec.qc.ca/ArcGIS/rest/services/CI/OperationDeneigement/MapServer/1/query?f=json&where=&geometry={"xmin":249093,"ymin":5186474,"xmax":249133,"ymax":5186514,"spatialReference":{"wkid":32187}}&outFields=STATION_NO,STATUT,DEBUT,FIN,DateMiseJour,STATIONNEMENT
