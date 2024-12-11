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
    .center()
    .cur();

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

  // Create a set to store the correct pods
  const correctPods = new Set();

  // Mouse down event to select pods
  pods.on('mousedown', event => {
    if (eternalsTileIndexes.includes(event.target.tileNum)) {
      // Outline the selected pod
      // We have to scale the circles because they are global, not inside scaled tile
      new Circle({
        radius: (event.target.width / 2) * pods.scale,
        color: clear,
        borderColor: white,
        borderWidth: 18,
        dashed: true,
      }).loc(event.target);

      // Add the pod to the correct pods set
      correctPods.add(event.target);

      // If we have selected all the correct pods, do something
      if (correctPods.size === numEternals) {
        pods.loop(pod => {
          pod.removeFrom();
        }, true);
      }
    } else {
      // Just do something for now...
      event.target.sca(0.5);
    }
  });

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
