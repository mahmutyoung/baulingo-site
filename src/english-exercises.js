export const englishExercises = {
  'en-coffee': {
    title: 'Order a coffee.', translation: 'A coffee, please.', sentence: 'Einen Kaffee, bitte.', next: 'en-tea',
    words: [{id:'bitte',text:'bitte.'},{id:'einen',text:'Einen'},{id:'coffee',text:'Kaffee,'}], answer:['einen','coffee','bitte'],
    hints: ['Start with “Einen”. Kaffee is masculine; a direct request uses the accusative form.', 'Next comes “Kaffee,” — the thing you are ordering.', 'Finish with “bitte” to make the request polite.'],
  },
  'en-tea': {
    title: 'Ask for a tea instead.', translation: 'A tea, please.', sentence: 'Einen Tee, bitte.', next: 'en-coffee',
    words:[{id:'tea',text:'Tee,'},{id:'bitte',text:'bitte.'},{id:'einen',text:'Einen'}], answer:['einen','tea','bitte'],
    hints:['Use “Einen” for this request: Tee is masculine too.', 'Put the drink, “Tee,” after “Einen”.', 'End your request with “bitte”.'],
  },
  'en-word-order': {
    title: 'Begin with “today”.', translation: 'Today I’m learning German.', sentence: 'Heute lerne ich Deutsch.',
    words:[{id:'ich',text:'ich'},{id:'heute',text:'Heute'},{id:'deutsch',text:'Deutsch.'},{id:'lerne',text:'lerne'}], answer:['heute','lerne','ich','deutsch'],
    hints:['Use “Heute” to put “today” first.', 'The verb “lerne” comes in the second position.', 'After the verb comes the subject, “ich”.', 'Finish with the language you are learning: “Deutsch”.'],
  },
  'en-articles': {
    title: 'Use the noun with its article.', translation: 'The window is open.', sentence: 'Das Fenster ist offen.',
    words:[{id:'offen',text:'offen.'},{id:'fenster',text:'Fenster'},{id:'das',text:'Das'},{id:'ist',text:'ist'}], answer:['das','fenster','ist','offen'],
    hints:['Fenster is neuter, so begin with “Das”.', 'Keep the noun “Fenster” with its article.', 'Use “ist” for “is”.', 'The describing word “offen” means “open”.'],
  },
  'en-appointments': {
    title: 'Ask to make an appointment.', translation: 'I’d like to make an appointment.', sentence: 'Ich möchte einen Termin vereinbaren.',
    words:[{id:'termin',text:'Termin'},{id:'vereinbaren',text:'vereinbaren.'},{id:'ich',text:'Ich'},{id:'einen',text:'einen'},{id:'moechte',text:'möchte'}], answer:['ich','moechte','einen','termin','vereinbaren'],
    hints:['Start with “Ich” — “I”.', '“Möchte” expresses “would like”.', 'Use “einen” with the masculine noun Termin here.', 'Next is the noun “Termin”, meaning “appointment”.', 'The infinitive “vereinbaren” goes at the end after möchte.'],
  },
};
