import React, {useState, useEffect} from 'react';
import moduleStyles from './dance-ai-modal.module.scss';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {setCurrentAiModalField, DanceState} from './danceRedux';
import {StrongText, Heading5} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {AiModalItem, AiModalReturnedItem} from './types';
import {BlockSvg} from 'blockly/core';
const Typist = require('react-typist').default;

const aiBotBorder = require('@cdo/static/dance/ai-bot-border.png');

const promptString = 'Generate a scene using this mood:';

const doAi = async (input: string) => {
  const systemPrompt =
    'You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: {backgroundColor: "black", backgroundEffect: "splatter", foregroundEffect: "rain", dancers: {type: "frogs", count: 3, layout: "circle"}}.  The only valid values for backgroundEffect are circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars.  The only valid values for backgroundColor are rave, cool, electronic, iceCream, neon, tropical, vintage, warm.  The only valid values for foregroundEffect are bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos.  Make sure you always generate all three of these values.  The dancers sub-object is optional, but when included, it has three parameters of its own: type must be one of the following: alien, bear, cat, dog, duck, frog, moose, pineapple, robot, shark, sloth, unicorn; count must be between 2 and 40 inclusive; layout must be one of the following: border, inner, diamond, circle, grid, top, row, bottom, left, column, right, x, plus, spiral, random.   Also, add a field called "explanation" to the result JSON, which contains a simple explanation of why you chose the values that you did, at the reading level of a 5th-grade school student, in one sentence of less than forty words.';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  console.log('do AI:', input);

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify({messages}),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  if (response.status === 200) {
    const res = await response.json();
    return res.content;
  } else {
    return null;
  }
};

export enum Mode {
  SELECT_INPUTS = 'selectInputs',
  GENERATING = 'generating',
  RESULTS = 'results',
  RESULTS_FINAL = 'resultsFinal',
}

interface DanceAiProps {
  onClose: () => void;
}

const DanceAiModal: React.FunctionComponent<DanceAiProps> = ({onClose}) => {
  const dispatch = useAppDispatch();

  const SLOT_COUNT = 3;

  const inputLibraryFilename = 'ai-inputs';
  const inputLibrary = require(`@cdo/static/dance/${inputLibraryFilename}.json`);

  const [mode, setMode] = useState(Mode.SELECT_INPUTS);
  const [currentInputSlot, setCurrentInputSlot] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [responseJson, setResponseJson] = useState<string>('');
  const [responseExplanation, setResponseExplanation] = useState<string>('');
  const [typingDone, setTypingDone] = useState<boolean>(false);

  const currentAiModalField = useSelector(
    (state: {dance: DanceState}) => state.dance.currentAiModalField
  );

  useEffect(() => {
    const currentValue = currentAiModalField?.getValue();
    console.log(currentValue);

    if (currentValue) {
      setMode(Mode.RESULTS_FINAL);

      // The block value will be set to this JSON.
      setResponseJson(currentValue);
    }
  }, [currentAiModalField]);

  const getImageUrl = (id: string) => {
    return `/blockly/media/dance/ai/${id}.png`;
  };

  const getAllItems = (slotIndex: number) => {
    if (slotIndex >= SLOT_COUNT) {
      return [];
    }

    return inputLibrary.options[slotIndex].map((option: string) => {
      const item = inputLibrary.items.find(
        (item: AiModalItem) => item.id === option
      );
      return {
        id: item.id,
        name: item.name,
        url: getImageUrl(item.id),
      };
    });
  };

  const getItemName = (id: string) => {
    return inputLibrary.items.find(
      (item: AiModalReturnedItem) => item.id === id
    )?.name;
  };

  const handleItemClick = (id: string) => {
    if (currentInputSlot < SLOT_COUNT) {
      setInputs([...inputs, id]);
      setCurrentInputSlot(currentInputSlot + 1);
    }
  };

  const handleGeneratingClick = () => {
    setMode(Mode.RESULTS);
  };

  const handleGenerateClick = () => {
    const inputNames = inputs.map(
      input =>
        inputLibrary.items.find((item: AiModalItem) => item.id === input).name
    );
    const request = `${promptString} ${inputNames.join(', ')}.`;
    startAi(request);
    setMode(Mode.GENERATING);
  };

  const startAi = async (value: string) => {
    const responseJsonString = await doAi(value);
    const response = JSON.parse(responseJsonString);

    // "Pick" a subset of fields to be used.  Specifically, we exclude the
    // explanation, since we don't want it becoming part of the code.
    const pickedResponse = (({
      backgroundEffect,
      backgroundColor,
      foregroundEffect,
      dancers,
    }) => ({backgroundEffect, backgroundColor, foregroundEffect, dancers}))(
      response
    );
    const pickedResponseJson = JSON.stringify(pickedResponse);

    // The block value will be set to this JSON.
    setResponseJson(pickedResponseJson);

    // The user will see this explanation.
    setResponseExplanation(response.explanation);
  };

  const convertBlocks = () => {
    const params = JSON.parse(responseJson);

    const blocksSvg = [
      Blockly.getMainWorkspace().newBlock(
        'Dancelab_setForegroundEffect'
      ) as BlockSvg,
      Blockly.getMainWorkspace().newBlock(
        'Dancelab_setBackgroundEffectWithPalette'
      ) as BlockSvg,
      Blockly.getMainWorkspace().newBlock(
        'Dancelab_makeNewDanceSpriteGroup'
      ) as BlockSvg,
    ];

    // Foreground block.
    blocksSvg[0].setFieldValue(params.foregroundEffect, 'EFFECT');

    // Background block.
    blocksSvg[1].setFieldValue(params.backgroundEffect, 'EFFECT');
    blocksSvg[1].setFieldValue(params.backgroundColor, 'PALETTE');

    // Dancers block.
    blocksSvg[2].setFieldValue(params.dancers.type.toUpperCase(), 'COSTUME');
    blocksSvg[2].setFieldValue(params.dancers.count.toString(), 'N');
    blocksSvg[2].setFieldValue(params.dancers.layout, 'LAYOUT');

    const origBlock = currentAiModalField?.getSourceBlock();

    if (
      origBlock &&
      currentAiModalField &&
      blocksSvg[0].previousConnection &&
      blocksSvg[1].previousConnection &&
      blocksSvg[2].previousConnection &&
      blocksSvg[2].nextConnection
    ) {
      blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);
      blocksSvg[1].nextConnection.connect(blocksSvg[2].previousConnection);

      if (!origBlock.getPreviousBlock()) {
        // This block isn't attached to anything at all.
        const blockXY = origBlock.getRelativeToSurfaceXY();
        blocksSvg[0].moveTo(blockXY);
      } else if (!origBlock?.getPreviousBlock()?.nextConnection) {
        // origBlock is the first input (for example, to a setup block),
        // without a regular code block above it.
        origBlock
          ?.getPreviousBlock()
          ?.getInput('DO')
          ?.connection?.connect(blocksSvg[0].previousConnection);
      } else {
        // origBlock has a regular block above it.
        origBlock
          ?.getPreviousBlock()
          ?.nextConnection?.connect(blocksSvg[0].previousConnection);
      }

      origBlock
        ?.getNextBlock()
        ?.previousConnection?.connect(blocksSvg[2].nextConnection);

      blocksSvg.forEach(blockSvg => {
        blockSvg.initSvg();
        blockSvg.render();
      });

      origBlock.dispose(false);

      // End modal.
      dispatch(setCurrentAiModalField(undefined));
    }
  };

  const handleDoneClick = () => {
    dispatch(setCurrentAiModalField(undefined));
  };

  const formatJsonString = (jsonString: string) => {
    return jsonString
      .replace(/":/g, '": ')
      .replace(/","/g, '", "')
      .replace(/,"/g, ', "');
  };

  // We might or might not wrap this with Typist.  Typist doesn't seem to cope
  // with this being a separate functional component.
  const resultsComponent = (mode === Mode.RESULTS ||
    mode === Mode.RESULTS_FINAL) && (
    <div>
      <Heading5>Code</Heading5>

      <pre className={classNames(moduleStyles.pre, moduleStyles.code)}>
        ai({formatJsonString(responseJson)})
      </pre>

      <div style={{display: responseExplanation !== '' ? 'block' : 'none'}}>
        <Heading5>Explanation</Heading5>
        <pre className={classNames(moduleStyles.pre, moduleStyles.explanation)}>
          {responseExplanation}
        </pre>
      </div>
    </div>
  );

  return (
    <AccessibleDialog
      className={moduleStyles.dialog}
      onClose={onClose}
      initialFocus={false}
    >
      <div id="inner-area" className={moduleStyles.innerArea}>
        <div id="text-area" className={moduleStyles.textArea}>
          <StrongText>
            {' '}
            {mode === Mode.SELECT_INPUTS
              ? 'Make a sentence by selecting some emoji.'
              : mode === Mode.GENERATING && responseJson === ''
              ? 'The AI is processing your sentence.'
              : mode === Mode.GENERATING && responseJson !== ''
              ? 'The AI is ready to generate results!'
              : mode === Mode.RESULTS && !typingDone
              ? 'The AI is generating results.'
              : mode === Mode.RESULTS && typingDone
              ? 'This is the result generated by the AI.'
              : mode === Mode.RESULTS_FINAL
              ? 'This was the result generated by the AI.'
              : undefined}
          </StrongText>
        </div>

        <div
          id="inputs-area"
          className={moduleStyles.inputsArea}
          style={{zIndex: mode === Mode.SELECT_INPUTS ? 1 : 0}}
        >
          {mode === Mode.SELECT_INPUTS && currentInputSlot < SLOT_COUNT && (
            <div className={moduleStyles.itemContainer}>
              {getAllItems(currentInputSlot).map(
                (item: AiModalReturnedItem, index: number) => {
                  return (
                    <div
                      tabIndex={
                        index === 0 && currentInputSlot === 0 ? 0 : undefined
                      }
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      style={{backgroundImage: `url(${item.url})`}}
                      className={moduleStyles.item}
                      title={item.name}
                    />
                  );
                }
              )}
            </div>
          )}
        </div>

        <div
          id="prompt-area"
          className={moduleStyles.promptArea}
          style={{
            zIndex:
              mode === Mode.SELECT_INPUTS || mode === Mode.GENERATING ? 1 : 0,
          }}
        >
          {(mode === Mode.SELECT_INPUTS ||
            (mode === Mode.GENERATING && responseJson === '')) && (
            <div className={moduleStyles.prompt}>
              {promptString}
              {Array.from(Array(SLOT_COUNT).keys()).map(index => {
                return (
                  <div key={index} className={moduleStyles.inputContainer}>
                    {index === currentInputSlot && (
                      <div
                        className={classNames(
                          moduleStyles.arrowDown,
                          currentInputSlot === 0 &&
                            moduleStyles.arrowDownFirstAppear
                        )}
                      >
                        &nbsp;
                      </div>
                    )}
                    <div className={moduleStyles.inputBackground}>&nbsp;</div>

                    {inputs[index] && (
                      <div
                        style={{
                          backgroundImage: `url(${getImageUrl(inputs[index])}`,
                        }}
                        className={moduleStyles.inputItem}
                        title={getItemName(inputs[index])}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div id="bot-area" className={moduleStyles.botArea}>
          {((mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT) ||
            mode === Mode.GENERATING ||
            mode === Mode.RESULTS ||
            mode === Mode.RESULTS_FINAL) && (
            <div className={moduleStyles.botContainer}>
              <img
                src={aiBotBorder}
                className={classNames(
                  moduleStyles.bot,
                  mode === Mode.SELECT_INPUTS
                    ? moduleStyles.botAppearCentered
                    : mode === Mode.GENERATING
                    ? moduleStyles.botAppearCentered
                    : mode === Mode.RESULTS
                    ? moduleStyles.botCenterToLeft
                    : mode === Mode.RESULTS_FINAL
                    ? moduleStyles.botLeft
                    : undefined
                )}
              />
            </div>
          )}
          {mode === Mode.GENERATING && responseJson === '' && (
            <div className={moduleStyles.spinner}>
              <FontAwesome
                title={undefined}
                icon="spinner"
                className={classNames('fa-pulse', 'fa-3x')}
              />
            </div>
          )}
        </div>

        <div
          id="outputs-area"
          className={moduleStyles.outputsArea}
          style={{
            zIndex:
              mode === Mode.RESULTS || mode === Mode.RESULTS_FINAL ? 1 : 0,
          }}
        >
          {mode === Mode.RESULTS && (
            <Typist
              startDelay={1500}
              avgTypingDelay={20}
              cursor={{show: false}}
              onTypingDone={() => {
                setTypingDone(true);
                currentAiModalField?.setValue(responseJson);
              }}
            >
              {resultsComponent}
            </Typist>
          )}
          {mode === Mode.RESULTS_FINAL && resultsComponent}
        </div>

        <div className={moduleStyles.buttonsArea}>
          {mode === Mode.SELECT_INPUTS && currentInputSlot >= SLOT_COUNT && (
            <Button
              id="select-all-sections"
              text={'Process'}
              onClick={handleGenerateClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {mode === Mode.GENERATING && responseJson !== '' && (
            <Button
              id="done"
              text={'Generate results'}
              onClick={handleGeneratingClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              className={moduleStyles.button}
            />
          )}

          {((mode === Mode.RESULTS && typingDone) ||
            mode === Mode.RESULTS_FINAL) && (
            <div>
              <Button
                id="convert"
                text={'Convert'}
                onClick={convertBlocks}
                color={Button.ButtonColor.brandSecondaryDefault}
                className={moduleStyles.button}
              />
              <Button
                id="done"
                text={'Use'}
                onClick={handleDoneClick}
                color={Button.ButtonColor.brandSecondaryDefault}
                className={moduleStyles.button}
              />
            </div>
          )}
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default DanceAiModal;
