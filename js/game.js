const assets = ['plasmapods.jpg'];
const path = 'https://zimjs.org/assets/';

const ready = () => {
  // Pods sprite sheet
  const pod = new Sprite({
    image: 'plasmapods.jpg',
    cols: 10,
    rows: 10,
  }).reg(CENTER);

  // Level variables
  const level = 0;
  const numEternals = level + 2;
  const cols = 4;
  const rows = 5;

  // Create the pods grid
  const pods = new Tile({
    obj: pod,
    cols,
    rows,
    spacingH: 10,
    spacingV: 10,
  })
    .scaleTo(S, 95, 95)
    .center();

  // Create the frame options
  const options = [];
  loop(100, i => {
    options.push(i);
  });

  // Randomize the frame options
  shuffle(options);

  // Take some frames out of the options to use as eternals
  const eternalsFrames = options.splice(0, numEternals);

  // Create all available tile indexes
  const allTileIndexes = [];
  loop(cols * rows, i => {
    allTileIndexes.push(i);
  });

  // Get two random spots for the eternals
  const eternalsTileIndexes = shuffle(allTileIndexes).splice(0, numEternals);

  interval({
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
});
