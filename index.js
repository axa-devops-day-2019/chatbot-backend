/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { NlpManager } = require('node-nlp');
const threshold = 0.5;
const nlpManager = new NlpManager({ languages: ['en', 'es', 'fr'], nlu: { log: true } });

let conversationContext = {};

nlpManager.load('./model.nlp');

exports.handler =  async function(event, context) {
  let body = JSON.parse(event.body);
  conversationContext = body.context;
  let language = await guessLanguage(nlpManager, body.message, conversationContext);
  let result = await nlpManager.process(language, body.message, conversationContext);
  let answer =
    result.score > threshold && result.answer
    ? result.answer
    : defaultAnswer(language);

  var response = { 
    statusCode: 200, 
    headers: { 
      "Access-Control-Allow-Origin": "*" 
    }, body: JSON.stringify( { message: answer, context: conversationContext} ) 
  };

  return response;
}

function guessLanguage(myNlpManager, message, context) {
  let detectedLanguage = myNlpManager.guessLanguage(message);
  if (detectedLanguage === 'en' || detectedLanguage === 'es' || detectedLanguage === 'fr' ) {
    return detectedLanguage;
  } else if (conversationContext && conversationContext.slotFill && conversationContext.slotFill.localeIso2) {
    return conversationContext.slotFill.localeIso2;
  }
  return 'en';
}

function defaultAnswer(language) {
  if (language === 'es') {
    return "Lo siento no entiendo"
  } else if (language === 'fr') {
    return "Désolé, je ne comprends pas"
  } else return "Sorry, I don't understand";
}