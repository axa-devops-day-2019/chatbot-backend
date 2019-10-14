const fs = require('fs')

const { NlpManager } = require('node-nlp');

async function trainRadar() {
    const manager = new NlpManager({ languages: ['en', 'es', 'fr'] });

    if (fs.existsSync('./model.nlp')) {
        manager.load('./model.nlp');
        console.log('Model loaded');
        //return;
    }

    const answerMap = {
        'Reinforce': ['Yes, please use more of {{ technology }}'],
        'Excel': ['You can definitely use {{ technology }}'],
        'Assess': ['Maybe, AXA IT is currently assessing {{ technology }}'],
        'Deprecated': ['This was used before but AXA IT does not recommend {{ technology }} anymore'],
        'Out': ['You should definitely not use {{ technology }}'],
        'Candidate': ['{{ technology }} is a candidate for use within AXA']
    }

    manager.addDocument('en', 'Should I use %technology%', 'technology.use')
    manager.addDocument('en', 'Tell me the status of %technology%', 'technology.use')
    manager.addDocument('en', 'What is the status of %technology%', 'technology.use')
    manager.addDocument('en', 'Is it possible to use %technology%', 'technology.use')
    manager.addDocument('en', 'Can I use %technology%', 'technology.use')
    manager.addDocument('en', 'Is %technology% safe to use', 'technology.use')
    manager.addDocument('en', 'Is it okay to use %technology%?', 'technology.use')
/*
    const gotClient = got.extend({
        responseType: 'json',
        prefixUrl: process.env.RADAR_API_URL,
        headers: {
            'Authorization': 'Bearer ' + process.env.RADAR_BEARER_TOKEN
        }
    });

    var response = await gotClient.get(process.env.RADAR_API_URL + '/api/entities/5d5188985d0af00006e8c77e/technologies');
    var jsonData = JSON.parse(response.body);

    jsonData.map(obj => {
        manager.addNamedEntityText('technology', obj.technology.name, ['en'], [obj.technology.key])
        answerMap[obj.status].map(answer => {
            manager.addAnswer('en', 'technology.use', answer, `technology === '${obj.technology.name}'`)
        })
    })
*/    
    // NOTE: Get response from radar API https://radar.paas.axa-asia.com/api/entities/5djjs5188985d0af00006e8c77e/technologies
    const response = require('./radar.json')
    response.map(obj => {
        manager.addNamedEntityText('technology', obj.technology.name, ['en'], [obj.technology.key])
        answerMap[obj.status].map(answer => {
            manager.addAnswer('en', 'technology.use', answer, `technology === '${obj.technology.name}'`)
        })
    })
    
    console.log('Training using radar data, please wait..');
    const hrstart = process.hrtime();
    await manager.train();
    const hrend = process.hrtime(hrstart);
    console.info('Trained (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
    console.log('Trained!');

    manager.save('./model.nlp', true);
}

trainRadar();
