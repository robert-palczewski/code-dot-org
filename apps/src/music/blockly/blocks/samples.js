import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  let block = ctx;
  while ((block = block.getParent())) {
    if (block.type === 'when_run') {
      return true;
    }
  }

  return false;
};

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    message0: 'play %1 at measure %2',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue('sound') +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n'
};

export const playSoundAtCurrentLocation = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
    message0: 'play %1',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue('sound') +
    '", ' +
    'currentMeasureLocation' +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n'
};

export const setCurrentLocationNextMeasure = {
  definition: {
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
    message0: 'go to next measure',
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx => 'currentMeasureLocation++\n'
};
