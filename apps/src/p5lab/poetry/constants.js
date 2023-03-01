export const PoetryStandaloneApp = {
  Poetry: 'poetry',
  PoetryHoc: 'poetry_hoc',
  TimeCapsule: 'time_capsule'
};

export const PALETTES = {
  grayscale: [
    '#000000',
    '#333333',
    '#666666',
    '#999999',
    '#CCCCCC',
    '#EEEEEE',
    '#FFFFFF'
  ],
  sky: ['#3878A4', '#82A9B1', '#ECCEC4', '#F8B8A8', '#E4929C', '#7D7095'],
  ocean: ['#7FD0F5', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
  sunrise: ['#F5DC72', '#F4B94F', '#F48363', '#F15C4C', '#372031'],
  sunset: ['#530075', '#921499', '#E559BB', '#F7B9DD', '#307087', '#123F50'],
  spring: ['#303F06', '#385202', '#547607', '#85AF4C', '#C1E876', '#D7FF6B'],
  summer: ['#FAD0AE', '#F69F88', '#EE6E51', '#BC4946', '#425D19', '#202E14'],
  autumn: ['#484F0C', '#AEA82E', '#EEBB10', '#D46324', '#731B31', '#4A173C'],
  winter: ['#EAECE8', '#E3DDDF', '#D3CEDC', '#A2B6BF', '#626C7D', '#A4C0D0'],
  twinkling: ['#FFC702', '#FC9103', '#F17302', '#B83604', '#7E1301'],
  rainbow: ['#A800FF', '#0079FF', '#00F11D', '#FF7F00', '#FF0900'],
  roses: ['#4C0606', '#86003C', '#E41F7B', '#FF8BA0 ', '#FFB6B3']
};

// Notes:
// - author is not translated.
// - Poems are shown in all languages, unless there is a locales attribute, in which case
//   the poem is shown in the dropdown only for users with a current locale that is included
//   in the array.
// - If the locales attribute is set, then title is used and is not translated.
// - If the locales attribute is set, then linesSplit is used and is not translated.
export const POEMS = {
  hafez: {author: 'Hafez'},
  field: {author: 'Eugene Field'},
  twain: {author: 'Mark Twain'},
  wordsworth: {author: 'William Wordsworth'},
  hughes: {author: 'Langston Hughes'},
  rios: {author: 'Alberto Rios'},
  hopler: {author: 'Jay Hopler'},
  singer: {author: 'Marilyn Singer\nfrom CENTRAL HEATING (Knopf, 2005)'},
  ewing: {author: 'Eve L. Ewing'},
  alexander: {
    author:
      'Kwame Alexander\nfrom "Booked" used by permission of Kwame Alexander'
  },
  harjo: {
    author:
      'Joy Harjo  Copyright © 1983\nfrom SHE HAD SOME HORSES by Joy Harjo.\nUsed by permission of W. W. Norton & Company, Inc.'
  },
  po: {author: 'Li Po'},
  tzu: {author: 'Lao Tzu'},
  taylor: {author: 'Ann Taylor and Jane Taylor'},
  carroll2: {author: 'Lewis Carroll'},
  carroll3: {author: 'Lewis Carroll'},
  rumi1: {author: 'Rumi'},
  rumi2: {author: 'Rumi'},
  hughes1: {author: 'Langston Hughes'},
  lomeli1: {author: 'Caia Lomeli'},
  lomeli2: {author: 'Caia Lomeli'},
  frost: {author: 'Robert Frost'},
  cb: {
    locales: ['en_us'],
    author: 'C. B.',
    title: 'My City',
    linesSplit: [
      'My city.',
      'I love the smell of the donuts',
      'on Avenue 6.',
      'The sound of the cats screeching',
      'at five in the morning.',
      'The feeling of my favorite song playing',
      'over and over again.',
      'When I go to a new city',
      'with different smells, sounds, and feelings,',
      "I'll still remember everything my city had."
    ]
  },
  rusinek1: {
    locales: ['pl_pl'],
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'WIESZAKI',
    linesSplit: [
      'Wszystkie dzieciaki',
      'wiedzą, co to wieszaki',
      'i że służą one zwłaszcza',
      'do wieszania płaszcza',
      'lub kurtki, lub pelerynki',
      'chłopczyka i dziewczynki.',
      '',
      'Lecz tak naprawdę wieszaki',
      'to są dzikie zwierzaki:',
      'zaczepne, rogate',
      'i okropnie pyskate!',
      'Kto słyszy ich awantury,',
      'chowa się do mysiej dziury.'
    ]
  },
  rusinek2: {
    locales: ['pl_pl'],
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'PRYSZNIC',
    linesSplit: [
      'Prysznic to nie jest zabawka.',
      'Prysznic to taka słuchawka',
      'do rozmów międzywannowych',
      'i międzyprysznicowych.',
      ' ',
      'Ważne, by podczas rozmowy',
      'nie przyszło ci czasem do głowy',
      'kręcić kurkiem, uparciuszku,',
      'bo będziesz mieć wodę w uszku!'
    ]
  },
  rusinek3: {
    locales: ['pl_pl'],
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'TOSTER',
    linesSplit: [
      'Do czego służy toster?',
      'To bardzo, bardzo proste:',
      'do opiekania grzanek,',
      'kiedy nadchodzi ranek.',
      '  ',
      'A kiedy się pozmienia',
      'tostera ustawienia,',
      'to służyć mu jest dane',
      'i do zwęglania grzanek.',
      '  ',
      'Ech, męczą się górnicy',
      'tak trochę po próżnicy,',
      'bo gdyby mieli toster,',
      'życie by było proste:',
      '  ',
      'Ustawiałby górnik na full',
      'swój toster – i siadał jak król.',
      'A węgiel by robił się sam.',
      'No, mówię wam!'
    ]
  },
  rusinek4: {
    locales: ['pl_pl'],
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'WAZON',
    linesSplit: [
      'Bez względu na to, czy w wazonie',
      'stoją żonkile, czy piwonie,',
      'wazon jest przede wszystkim po to,',
      'by dać się czasem rozbić kotom.'
    ]
  },
  rusinek5: {
    locales: ['pl_pl'],
    author: 'Michał Rusinek, Wierszyki domowe, Znak, 2021',
    title: 'SŁOIKI',
    linesSplit: [
      'Stoją w piwnicy puste słoiki.',
      'W jednym z nich były raz borowiki,',
      'w innym pieczarki marynowane,',
      'a w jeszcze innym ćwikła wraz z chrzanem.',
      '  ',
      'Gdy ze słoików wszystko zjedzono,',
      'to je umyto i wysuszono.',
      'Zniesiono tutaj ich zapas spory*,',
      'bo mogą przydać się na przetwory.',
      '  ',
      'Ten, kto na podróż w czasie ma chętkę,',
      'może odkręcić jedną zakrętkę:',
      'wtedy ze środka uleci wokół',
      'trochę powietrza – z zeszłego roku!'
    ]
  },
  quasimodo: {
    locales: ['it_it'],
    author: 'Salvatore Quasimodo',
    title: 'Specchio',
    linesSplit: [
      'Ed ecco sul tronco',
      'si rompono gemme:',
      "un verde più nuovo dell'erba",
      'che il cuore riposa:',
      'il tronco pareva già morto,',
      'piegato sul botro.',
      '  ',
      'E tutto mi sa di miracolo;',
      "e sono quell'acqua di nube",
      'che oggi rispecchia nei fossi',
      'più azzurro il suo pezzo di cielo,',
      'quel verde che spacca la scorza',
      "che pure stanotte non c'era."
    ]
  },
  pascoli: {
    locales: ['it_it'],
    author: 'Giovanni Pascoli',
    title: 'Mare',
    linesSplit: [
      "M'affaccio alla finestra, e vedo il mare:",
      "vanno le stelle, tremolano l'onde.",
      'Vedo stelle passare, onde passare:',
      'un guizzo chiama, un palpito risponde.',
      '  ',
      "Ecco sospira l'acqua, alita il vento:",
      "sul mare è apparso un bel ponte d'argento.",
      '  ',
      'Ponte gettato sui laghi sereni,',
      'per chi dunque sei fatto e dove meni?'
    ]
  },
  rodari: {
    locales: ['it_it'],
    author: 'Gianni Rodari',
    title: 'Como nel comò',
    linesSplit: [
      'Una volta un accento per distrazione cascò',
      'sulla città di Como mutandola in comò.',
      '  ',
      'Figuratevi i cittadini comaschi, poveretti:',
      'detto e fatto si trovarono rinchiusi nei cassetti.',
      '  ',
      'Per fortuna uno scolaro rilesse il componimento',
      "e liberò i prigionieri cancellando l'accento.",
      '  ',
      'Ora ai giardini pubblici han dedicato un busto',
      '"A colui che sa mettere gli accenti al posto giusto".'
    ]
  },
  ungaretti: {
    locales: ['it_it'],
    author: 'Giuseppe Ungaretti',
    title: 'Sereno',
    linesSplit: [
      'Dopo tanta nebbia',
      'a una a una',
      'si svelano le stelle',
      '  ',
      'Respiro il fresco',
      'che mi lascia il colore del cielo',
      '  ',
      'Mi riconosco',
      'immagine passeggera',
      '  ',
      'Presa in un giro immortale.'
    ]
  },
  carducci1: {
    locales: ['it_it'],
    author: 'Giosuè Carducci',
    title: 'Il bove',
    linesSplit: [
      "T'amo pio bove; e mite un sentimento",
      "Di vigore e di pace al cor m'infondi,",
      'O che solenne come un monumento',
      'Tu guardi i campi liberi e fecondi,',
      '  ',
      'O che al giogo inchinandoti contento',
      "L'agil opra de l'uom grave secondi:",
      "Ei t'esorta e ti punge, e tu co 'l lento",
      'Giro dè pazienti occhi rispondi.',
      '  ',
      "E del grave occhio glauco entro l'austera",
      'Dolcezza si rispecchia ampio e quieto',
      'Il divino del pian silenzio verde.'
    ]
  },
  carducci2: {
    locales: ['it_it'],
    author: 'Giosuè Carducci',
    title: 'San Martino',
    linesSplit: [
      "La nebbia a gl'irti colli piovigginando sale,",
      'e sotto il maestrale urla e biancheggia il mar;',
      "ma per le vie del borgo dal ribollir de' tini",
      "va l'aspro odor de i vini l'anime a rallegrar.",
      "Gira su' ceppi accesi lo spiedo scoppiettando:",
      "sta il cacciator fischiando sull'uscio a rimirar",
      "tra le rossastre nubi stormi d'uccelli neri,",
      "com'esuli pensieri, nel vespero migrar."
    ]
  }
};

export const TIME_CAPSULE_POEMS = {
  pat: {
    locales: ['en_us'],
    author: 'Pat Y.',
    title: '1990 - My Poem 1',
    linesSplit: [
      'I love to ride my skateboard all around',
      "With my Walkman blasting, I don't hear a sound",
      'I just learned how to do a sweet new trick',
      "It's called the kickflip and it's really sick",
      '\n',
      'Something happening right now is Yo MTV Raps',
      'Watching Salt-N-Pepa and LL Cool J, mad snaps',
      'Slap bracelets are something cool',
      'And neon colors, they totally rule.'
    ]
  },
  erin: {author: 'Erin P.'},
  aryanna: {
    locales: ['en_us'],
    author: 'Aryanna T.',
    title: '2021 - My Poem 3',
    linesSplit: [
      "Today in 2021, I'm cool as can be,",
      "I love to dance, and listen to music that's so me.",
      "I just learned to skateboard, and it's rad,",
      "I'm thinking about trying out for the cheer squad.",
      '\n',
      'In my neighborhood, we all have our own flair,',
      'People I know like to ride bikes, and style their hair.',
      "Something fun right now is TikTok, can't you see?",
      'Dancing is popular, and I love the energy.'
    ]
  },
  tj: {author: 'TJ'},
  erik: {author: 'Erik D.'},
  aaron: {author: 'Aaron H.'},
  noemi: {author: 'Noemi R.'},
  ken: {author: 'Ken A.'},
  mike: {author: 'Mike H.'},
  jess: {author: 'Jess B.'}
};
