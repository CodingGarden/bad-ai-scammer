const scammerElement = document.querySelector('#scammer-text');
const scamBaiterResponseElement = document.querySelector('#scam-baiter-text');
console.log(speechSynthesis.getVoices());

const scammerVoice = speechSynthesis.getVoices().find((voice) => voice.name === 'Veena');
const scamBaiterVoice = speechSynthesis.getVoices().find((voice) => voice.name === 'Alex');

const rnn = ml5.charRNN('models/woolf/', () => {
  const client = new tmi.Client({
    channels: ['codinggarden'],
  });

  const queue = [];
  let running = false;

  client.connect();

  client.on('message', (channel, tags, message, self) => {
    const [command, ...args] = message.split(' ');
    if (command === '!scammer-says') {
      const seed = args.join(' ').trim();
      if (seed) {
        queue.push({
          seed,
        });

        if (!running) {
          checkQueue();
        }
      }
    }
  });

  function checkQueue() {
    running = true;
    const next = queue.shift();
    if (next) {
      // increase length of response...
      const scammerUtterance = new SpeechSynthesisUtterance(next.seed);
      scammerUtterance.voice = scammerVoice;
      scammerUtterance.lang = 'en-US';
      scammerUtterance.rate = 0.75;
      speechSynthesis
        .speak(scammerUtterance);
      scammerElement.textContent = next.seed;
      rnn.generate({ seed: next.seed + '?', length: 50 }, (err, results) => {
        const response = results.sample.split('.')[0];
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.voice = scamBaiterVoice;
        utterance.rate = 0.75;
        scamBaiterResponseElement.textContent = response;

        speechSynthesis
          .speak(utterance);

        utterance.onend = checkQueue;
      });
    }
  }
});
