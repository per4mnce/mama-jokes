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
    recipes = require('./recipes');

var APP_ID = 'amzn1.echo-sdk-ams.app.2abbf8ec-05e3-49d1-b097-144663b180f7'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var categories  = "fat, stupid, ugly, old, poor, short, skinny, smells ,bald";  //List of all joke categories

/**
 * MinecraftHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MinecraftHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MinecraftHelper.prototype = Object.create(AlexaSkill.prototype);
MinecraftHelper.prototype.constructor = MinecraftHelper;

MinecraftHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to Yo Mama Jokes by Henry Schaumburger. You can request a category by saying, ask Yo Mama about category." +  
        categories + "... Now, what category would you like?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

MinecraftHelper.prototype.intentHandlers = {
    "RecipeIntent": function (intent, session, response) {
        console.log("INTENT: " + intent);
        console.log("SESSION: " + session);
        console.log("RESPONSE: " + response);
        var itemSlot = intent.slots.Item,
            itemName;
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();
        }

        var cardTitle = "Joke for category: " + itemName,
            jokeIndex,
            recipe,
            speechOutput,
            repromptOutput;
        
        //Lookup joke only when category is valid
        if (isValidCategory(itemName)) {
            jokeIndex = getRandomInt(0, recipes[itemName].length - 1),
            recipe = recipes[itemName][jokeIndex];
        }        
        if (recipe) {
            speechOutput = {
                speech: recipe,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, recipe);
        } else {
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not know jokes in the category of " + itemName + 
                         ". Now, what category would you like?  Choices include " + categories;
            } else {
                speech = "I'm sorry, I currently do not know that category." + 
                         "What category would you like?  Choices include " + categories;
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
        var speechOutput = "Goodbye from stop";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye from cancel";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask a question like, tell me a joke about a category..." + 
            "Categories include: " + categories + 
            "Or, you can say exit... Now, what can I help you with?";
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
    var minecraftHelper = new MinecraftHelper();
    minecraftHelper.execute(event, context);
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//Determine if an item is in the category list
function isValidCategory(txt){
    var found = true;
    if (categories.indexOf(txt) === -1) {
        found = false;
    }
  return found;
};

