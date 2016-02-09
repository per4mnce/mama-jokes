/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Yo Mama about fat"
 *  Alexa: "(reads back joke)"
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    jokes = require('./data');

var APP_ID = 'amzn1.echo-sdk-ams.app.2abbf8ec-05e3-49d1-b097-144663b180f7'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var categories  = "fat, stupid, ugly, old, poor, short, skinny, smells, bald";  //List of all joke categories

/**
 * JokeHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var JokeHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
JokeHelper.prototype = Object.create(AlexaSkill.prototype);
JokeHelper.prototype.constructor = JokeHelper;

JokeHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to Yo Mama Jokes by Henry Schaumburger. You can request a category by saying, ask Yo Mama to tell me a joke about a category such as ..." +  
                     categories + "... Now, what category would you like?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

JokeHelper.prototype.intentHandlers = {
    "JokeIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Item,
            categoryName;
        if (itemSlot && itemSlot.value){
            categoryName = itemSlot.value.toLowerCase();
        }

        var cardTitle,
            joke,
            jokeIndex,
            repromptOutput,
            speechOutput;
        
        //Select a randon category if one is not provided
        if (categoryName === undefined) {
            var categoryArray = categories.split(', ');
            var categoryIndex = getRandomInt(0, categoryArray.length - 1);
            categoryName = categoryArray[categoryIndex];
        } 
        
        //Lookup joke and cardTitle only when category is valid
        if (isValidCategory(categoryName)) {
            jokeIndex = getRandomInt(0, jokes[categoryName].length - 1),
            joke = jokes[categoryName][jokeIndex];
            cardTitle = "Joke for category: " + categoryName
        }        
        if (joke) {
            speechOutput = {
                //speech: "<speak>" + joke + "<audio src='https://s3.amazonaws.com/sounds226/boom.mp3'/></speak>",
                speech: "<speak>" + joke + "<audio src='https://s3.amazonaws.com/sounds226/" + rndSound() + "'/></speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            response.tellWithCard(speechOutput, cardTitle, joke);
        } else {
            var speech;
            if (categoryName) {
                speech = "I'm sorry, I currently do not know jokes in the " + categoryName + " category. "
                         +"Now, what category would you like?  Choices include " + categories;
            } else {
                speech = "I'm sorry, I currently do not know that category. "
                         +"What category would you like?  Choices include " + categories;
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask a question like, tell me a joke about a category..." + 
            "Categories include: " + categories + 
            "... Or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, tell me a joke about fat or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var jokeHelper = new JokeHelper();
    jokeHelper.execute(event, context);
};


//Returns a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//Returns a random sound file name
function rndSound() {
    var fileNames = ['NyukNyuk.mp3', 'boom.mp3', 'laugh1.mp3', 'laugh2.mp3', 'laugh3.mp3', 'laugh4.mp3'];
    return(fileNames[getRandomInt(0, fileNames.length - 1)]);
}

//Determine if an item is in the category list
function isValidCategory(txt) {
    var found = true;
    if (categories.indexOf(txt) === -1) {
        found = false;
    }
  return found;
};

