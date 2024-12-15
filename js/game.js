// Assets to load
const audioSpriteData = {
  src: 'audiosprite.mp3',
  audioSprite: [
    // [id, startime(in seconds), endtime(in seconds)]
    ['blackball', 1.041, 2.475],
    ['bounce', 3.567, 4.232],
    ['end', 5.396, 9.315],
    ['help', 10.373, 10.499],
    ['powerdown', 11.607, 14.254],
    ['powerup', 15.672, 17.081],
    ['slow', 18.354, 19.163],
    ['start', 20.151, 23.594],
    ['submit', 24.931, 27.673],
    ['wallend', 28.632, 29.351],
    ['wallstart', 30.64, 32.323],
  ],
};
const assets = ['plasmapods.jpg', 'gf_Honk', 'intro.mp3', audioSpriteData];
const path = 'https://zimjs.com/assets/';

// Show the progress of loading assets
const progress = new Waiter();

// Game variables
const levelSizes = [
  [4, 5],
  [5, 7],
  [6, 8],
  [7, 10],
  [8, 11],
];
let muted = false;

// Create an emitter to use when selecting pods
const emitter = new Emitter({
  obj: new Circle({
    radius: 90,
    color: clear,
    borderColor: series(pink, purple),
    borderWidth: 18,
    dashed: true,
  }),
  interval: 0.3,
  gravity: 0,
  force: 0,
  animation: {
    props: {
      scale: 5,
    },
  },
  startPaused: true,
});

/**
 * Make a level
 *
 * @param {number} level The level to make. Defaults to 0.
 */
const makeLevel = (level = 0) => {
  // Check available levels
  if (level >= levelSizes.length) {
    // We have no more levels, so do something
    return;
  }

  // Pods sprite sheet
  const pod = new Sprite({
    image: 'plasmapods.jpg',
    cols: 10,
    rows: 10,
  }).reg(CENTER);

  // Create the pods grid
  const [cols, rows] = levelSizes[level];
  const pods = new Tile({
    obj: pod,
    cols,
    rows,
    spacingH: 10,
    spacingV: 10,
  })
    .scaleTo(S, 95, 95)
    .center()
    .cur();

  // Create the rings container
  const rings = new Container({
    width: W,
    height: H,
  }).addTo();

  // Animate the pods in
  pods.alp(0).animate({
    props: {
      alpha: 1,
    },
    time: 0.5,
  });

  // Create the frame options
  const options = [];
  loop(100, i => {
    options.push(i);
  });

  // Randomize the frame options
  shuffle(options);

  // Take some frames out of the options to use as eternals
  const numEternals = level + 2;
  const eternalsFrames = options.splice(0, numEternals);

  // Create all available tile indexes
  const allTileIndexes = [];
  loop(cols * rows, i => {
    allTileIndexes.push(i);
  });

  // Get two random spots for the eternals
  const eternalsTileIndexes = shuffle(allTileIndexes).splice(0, numEternals);

  // Create a set to store the correct pods
  const correctPods = new Set();

  // Change pods positions every second
  const podsInterval = interval({
    // Time in seconds
    time: 1,
    immediate: true,
    call: () => {
      shuffle(options);
      // Loop through all the pods and set the frame
      pods.loop((pod, i) => {
        // If the pod with index i is an eternal, set the frame to the eternal frame
        // Otherwise, set its frame to the corresponding frame from the options array
        pod.frame = eternalsFrames[eternalsTileIndexes.indexOf(i)] ?? options[i];
      });
      S.update();
    },
  });

  // Sounds
  const backgroundSound = new Aud({
    file: 'intro.mp3',
    volume: 0.1,
    loop: true,
  });
  const startSound = new Aud({
    file: 'wallstart',
    volume: 0.3,
  });
  const rightSound = new Aud({
    file: 'powerup',
    volume: 0.3,
  });
  const wrongSound = new Aud({
    file: 'wallend',
    volume: 0.3,
  });
  let backgroundSoundInstance = backgroundSound.play();
  if (muted) {
    backgroundSoundInstance.fade(0);
  } else {
    backgroundSoundInstance.fade(0.1);
    startSound.play();
  }

  // Bottom interface
  const mute = new Button({
    width: 80,
    backing: makeIcon('sound', orange).sca(2),
    toggleBacking: makeIcon('mute', orange).sca(2),
  })
    // Expand the button so it easier to tap in mobile
    .expand()
    .tap(() => {
      muted = mute.toggled;
      if (muted) {
        backgroundSoundInstance.fade(0);
      } else {
        backgroundSoundInstance.fade(0.1);
      }
    });
  if (muted) {
    mute.toggle();
  }
  const find = new Label({
    text: `Find ${numEternals}`,
    size: 85,
    font: 'Honk',
  });
  const timer = new Timer({
    backgroundColor: new GradientColor([yellow, red], 90),
    down: false,
    time: 0,
  });
  const bottom = new Tile({
    obj: [mute, find, timer],
    cols: 3,
    rows: 1,
    spacingH: 80,
    spacingV: 0,
    unique: true,
  }).pos(0, 40, CENTER, BOTTOM);

  // Mouse down event to select pods
  pods.on('mousedown', event => {
    if (eternalsTileIndexes.includes(event.target.tileNum)) {
      // Emit particles
      emitter.loc(event.target).spurt(2);
      // Make sure the emitter particles are on top
      emitter.particles.top();

      // Play the right sound
      if (!muted) {
        rightSound.play();
      }

      // Outline the selected pod
      // We have to scale the circles because they are global, not inside scaled tile
      new Circle({
        radius: (event.target.width / 2) * pods.scale,
        color: clear,
        borderColor: white,
        borderWidth: 18,
        dashed: true,
      })
        .loc({
          target: event.target,
          container: rings,
        })
        .alp(0)
        .animate({
          wait: 0.5,
          alpha: 0.9,
        });

      // Add the pod to the correct pods set
      correctPods.add(event.target);

      // If we have selected all the correct pods, do something
      if (correctPods.size === numEternals) {
        // Stop the timer
        timer.stop();

        // Stop background sound
        backgroundSoundInstance.fade(0);

        // Hide bottom interface
        bottom.animate({
          props: {
            alpha: 0,
          },
          time: 1.5,
        });

        // Animate out the previous pods
        // Caching makes animating smoother on mobile
        pods.cache().animate({
          props: {
            alpha: 0,
          },
          wait: 1,
          time: 0.5,
          call: target => {
            target.dispose();
          },
        });

        // Show the eternals
        const showcase = new Tile({
          obj: pod.clone().sca(1.5),
          cols: 2,
          rows: 3,
          spacingH: 20,
          spacingV: 20,
          count: numEternals,
        }).center();
        showcase.loop((pod, i) => {
          pod.run({
            startFrame: eternalsFrames[i],
            endFrame: eternalsFrames[i],
          });
        });
        showcase.alp(0).animate({
          props: {
            alpha: 1,
          },
          wait: 1.5,
          time: 0.5,
          rewindWait: 1,
          rewind: true,
          call: target => {
            target.dispose();
            // Advance to the next level
            makeLevel(level + 1);
          },
        });

        // Clear the current interval
        podsInterval.clear();

        // Clear the rings
        rings.top().animate({
          rewind: true,
          time: 0.5,
          props: {
            alpha: 0,
          },
          rewindCall: () => {
            rings.removeAllChildren();
          },
        });
      }
    } else {
      // Play the wrong sound
      if (!muted) {
        wrongSound.play();
      }
      // Add 10 seconds to the timer
      timer.time += 10;
    }
  });
};

const ready = () => {
  // Create the title
  new Label({
    text: 'ETERNAL ORBS',
    size: 110,
    font: 'Honk',
  }).pos(0, 50, CENTER);

  // Leader board
  const leaderBoard = new LeaderBoard({
    corner: 0,
    backgroundColor: dark,
    titleColor: light,
    title: 'Lowest Finish Times',
    reverse: true,
  })
    .scaleTo(S, 90, 90)
    .center()
    .mov(0, 20);

  // Play button
  const play = new Button({
    label: 'PLAY',
    backgroundColor: new GradientColor([orange, purple], 90),
  })
    .pos(0, 40, CENTER, BOTTOM)
    .tap(() => {
      leaderBoard.removeFrom();
      play.removeFrom();
      makeLevel();
    });

  leaderBoard.on('close', () => {
    play.removeFrom();
    makeLevel();
  });
};

new Frame({
  scaling: FIT,
  width: 720,
  height: 1280,
  color: black,
  outerColor: darker,
  ready,
  assets,
  path,
  progress,
});
