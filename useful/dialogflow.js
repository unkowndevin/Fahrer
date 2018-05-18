//https://stackoverflow.com/questions/24564470/unity3d-and-android-studio-integration

const ApiAI = require('apiai');

class DialogFlow {

   constructor(sessionID){

      this.dialogflow = new ApiAI('62c0dd3a28e040b3819d6366e895d48d');
      this.sessionID = sessionID;

   }

   sendMessage(message){

     return new Promise((resolve, reject) => {

          let request = this.dialogflow.textRequest(message, {
               sessionId: this.sessionID
          });

          request.on('response', (response) => {

               resolve(
                 this.prepareDiagnosticResponse(response)
                );

          })

          request.on('error', (err) => {

               reject(err);

          });

          request.end();

     });

   }

   prepareDiagnosticResponse(response){
    let diagnostic = {},
        intent = response.result.metadata.intentName.split("."),
        params = response.result.parameters || {},
        sent = response.result.resolvedQuery || "",
        timestamp = response.timestamp,
        speech = response.result.fulfillment.messages[0].speech || "",
        end = response.result.metadata.endConversation || false

    intent[1]=="diagnostic" && intent[2]=="comienzo" ? 
      diagnostic.begin = timestamp : delete diagnostic.begin
    
    intent[1]=="diagnostic" && intent[2]=="fin" ? 
      diagnostic.end = timestamp : delete diagnostic.end
    
    if(intent[0] == "diagnostic" && intent[2] == "persistence"){
      let date = new Date(params["date"] || params["date-period"] || "")
      let severity = 0
      let note = ""
      switch(intent[1]){
        case "low":
          sevrity = 1
          if(params["ambiguedad-tiempo-corto"]){
            note = "Se ha dado una respuesta muy ambigüa como para determinar la severidad o realidad de la fobia respecto al tiempo, sin embargo, se han utilizado palabras que desestiman la importancia del tiempo durante el que se ha padecido."
          }else{
            note = "La respuesta obtenida referente al tiempo durante el cual se ha padecido de un miedo permite dar una idea de la severidad de la fobia, no obstante, debido al corto periodo de tiempo indicado se considerarán otros aspectos."
          }
        break;
        case "medium":
        severity = 2
          note = "La respuesta obtenida referente al tiempo durante el cual se ha padecido de un miedo permite dar una idea de la severidad de la fobia, sin embargo, debido al tiempo durante el que se ha tenido el miedo este aspecto no se considerara tan importante pero tampoco será ignorado."
        break;
        case "high":
        severity = 3
          if(params["ambiguedad-tiempo-alto"]){
            note = "Se ha dado una respuesta muy ambigüa como para determinar la severidad o realidad de la fobia respecto al tiempo, sin embargo, se han utilizado palabras que denotan una larga duración al tiempo durante el que se ha padecido el miedo."
          }else{
            note = "La respuesta obtenida referente al tiempo durante el cual se ha padecido de un miedo permite dar una idea de la severidad de la fobia, razón por la cual dado el largo periodod de tiempo durante el que se ha padecido sera un aspecto importante."
          }
        break;
        default:
          note = ""
        break;
      }
      diagnostic.persistence = {

        estimated: date,
        received: sent,
        note: note,
        severity: severity

      }
    }

    diagnostic.message = {
      timestamp: timestamp,
      sent: sent,
      speech: speech,
      intent: intent[2]
    }

    diagnostic.speech = speech
    if(params["negative_words"]){
      diagnostic.highlight = true
      diagnostic.highlightWord = true
      diagnostic.words = params["negative_words"]
    }
    
    diagnostic.severity = {
      low: (intent.indexOf("low")+1)/2,
      medium: (intent.indexOf("medium")+1)/2,
      high: (intent.indexOf("high")+1)/2
    }

    diagnostic.end = end
    
    
    return diagnostic

   }

}



module.exports = DialogFlow;

let a = {
  "id": "e2f8a278-8f76-40f5-b580-c9618d889794",
  "timestamp": "2018-05-07T19:31:27.916Z",
  "lang": "es",
  "result": {
    "source": "agent",
    "resolvedQuery": "hola",
    "action": "",
    "actionIncomplete": false,
    "parameters": {},
    "contexts": [
      {
        "name": "nombre",
        "parameters": {},
        "lifespan": 1
      }
    ],
    "metadata": {
      "intentId": "c084bcfa-4539-4c1e-9d3c-99e8ef711777",
      "webhookUsed": "false",
      "webhookForSlotFillingUsed": "false",
      "intentName": "conversacion.saludo.comun"
    },
    "fulfillment": {
      "speech": "Hola. Soy Fahrer, por si tenías curiosidad. ¿Como te llamas?",
      "messages": [
        {
          "type": 0,
          "speech": "¡Hola! puedes llamarme Fahrer, como puedo llamarte?"
        }
      ]
    },
    "score": 1
  },
  "status": {
    "code": 200,
    "errorType": "success"
  },
  "sessionId": "ada24d70-20ef-492c-b069-9c04d424c267"
}
let b = {
  "id": "b1e7a600-f313-4b93-9dd3-17f024de9ba3",
  "timestamp": "2018-05-07T20:04:33.597Z",
  "lang": "es",
  "result": {
    "source": "agent",
    "resolvedQuery": "no",
    "action": "",
    "actionIncomplete": false,
    "parameters": {
      "expresiones_negativas": "no",
      "verbo_preferencia": "",
      "momento_futuro_lejano": "",
      "momento_ahora": ""
    },
    "contexts": [],
    "metadata": {
      "intentId": "3ebf59d1-3d35-47ee-abec-96d79d862954",
      "webhookUsed": "false",
      "webhookForSlotFillingUsed": "false",
      "endConversation": true,
      "intentName": "conversacion.comienzo.negativo"
    },
    "fulfillment": {
      "speech": "Tu decides cuando. Espero verte pronto, alan",
      "messages": [
        {
          "type": 0,
          "speech": "Si no estas listo ahora no te preocupes, te esperare después. Adiós Alan"
        }
      ]
    },
    "score": 1
  },
  "status": {
    "code": 200,
    "errorType": "success"
  },
  "sessionId": "ada24d70-20ef-492c-b069-9c04d424c267"
}

let c = {
  "id": "b8f16d22-be45-43c4-a444-7d77417aa069",
  "timestamp": "2018-05-11T01:36:53.59Z",
  "lang": "es",
  "result": {
    "source": "agent",
    "resolvedQuery": "h",
    "contexts": [],
    "metadata": {},
    "fulfillment": {
      "speech": ""
    },
    "score": 0
  },
  "status": {
    "code": 200,
    "errorType": "success"
  },
  "sessionId": "8e953d5e-7148-45f9-b814-577abd7d9d99"
}
/*
heroku  https://git.heroku.com/undevin.git (fetch)
heroku  https://git.heroku.com/undevin.git (push)
origin  https://github.com/unkowndevin/Fahrer.git (fetch)
origin  https://github.com/unkowndevin/Fahrer.git */