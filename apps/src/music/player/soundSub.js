import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import SoundEffects from './soundEffects';

// audio
var audioContext = null;

var soundEffects = null;

// Time constant used to compute the release rate; at each time constant
// interval the sound will decay exponentially.
const RELEASE_TIME_CONSTANT = 0.075;

function createAudioContext(desiredSampleRate) {
  var AudioCtor = window.AudioContext || window.webkitAudioContext;

  desiredSampleRate =
    typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
  var context = new AudioCtor();

  // Check if hack is necessary. Only occurs in iOS6+ devices
  // and only when you first boot the iPhone, or play a audio/video
  // with a different sample rate
  if (
    /(iPhone|iPad)/i.test(navigator.userAgent) &&
    context.sampleRate !== desiredSampleRate
  ) {
    var buffer = context.createBuffer(1, 1, desiredSampleRate);
    var dummy = context.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(context.destination);
    dummy.start(0);
    dummy.disconnect();

    context.close(); // dispose old context
    context = new AudioCtor();
  }

  return context;
}

/**
 * @param {*} options Optional audio system configuration.
 *   {
 *     delayTimeSeconds: number, // Delay time used in the delay effect
 *     releaseTimeSeconds: number // Release time for fading out fixed-duration sounds
 *   }
 */
function WebAudio(options) {
  const {delayTimeSeconds, releaseTimeSeconds} = options;
  try {
    audioContext = createAudioContext(48000);
  } catch (e) {
    Lab2MetricsReporter.logError(
      'Web Audio API is not supported in this browser',
      e
    );
    throw e;
  }

  soundEffects = new SoundEffects(audioContext, delayTimeSeconds);
  this.releaseTimeSeconds = releaseTimeSeconds;
}

WebAudio.prototype.getCurrentTime = function () {
  if (audioContext) {
    return audioContext.currentTime;
  } else {
    return null;
  }
};

WebAudio.prototype.LoadSound = function (url, callback, onLoadFinished) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function () {
    try {
      audioContext.decodeAudioData(
        request.response,
        function (buffer) {
          callback(buffer);
          onLoadFinished();
        },
        function (e) {
          Lab2MetricsReporter.logError('Error decoding audio data', e, {url});
          onLoadFinished();
        }
      );
    } catch (e) {
      Lab2MetricsReporter.logError('Error decoding audio data', e, {url});
      onLoadFinished();
    }
  };
  request.send();
};

WebAudio.prototype.LoadSoundFromBuffer = function (buffer, callback) {
  try {
    audioContext.decodeAudioData(
      buffer,
      function (buffer) {
        callback(buffer);
      },
      function (e) {
        console.log('error ', e);
      }
    );
  } catch (e) {
    Lab2MetricsReporter.logError('Error loading sound from buffer', e);
  }
};

WebAudio.prototype.StartPlayback = function () {
  if (['suspended', 'interrupted'].includes(audioContext.state)) {
    audioContext.resume();
  }
};

WebAudio.prototype.PlaySoundByBuffer = function (
  audioBuffer,
  id,
  when,
  loop,
  effects,
  callback,
  duration
) {
  const source = audioContext.createBufferSource(); // creates a sound source
  source.buffer = audioBuffer; // tell the source which sound to play
  let currentNode = source;

  if (duration) {
    // If playing for a specific duration, apply a small fadeout to the sound
    // to prevent clicks and pops
    const gainNode = audioContext.createGain();
    const releaseDuration = this.releaseTimeSeconds;
    gainNode.gain.setTargetAtTime(
      0,
      when + duration - releaseDuration,
      RELEASE_TIME_CONSTANT
    );
    source.connect(gainNode);
    currentNode = gainNode;
  }

  if (effects) {
    // Insert sound effects, which will connect to the output.
    soundEffects.insertEffects(effects, currentNode);
  } else {
    // No sound effects, so we will connect directly to the output.
    currentNode.connect(audioContext.destination);
  }
  source.onended = callback.bind(this, id);

  source.loop = loop;

  source.start(when, 0, duration); // play the source now

  if (['suspended', 'interrupted'].includes(source.context.state)) {
    source.context.resume();
  }

  return source;
};

WebAudio.prototype.StopSoundBySource = function (source) {
  // todo: investigate whether this condition is needed/useful
  // across browsers.

  //if (source.context.state === 'running') {
  source.stop();
  //}
};

export default WebAudio;
