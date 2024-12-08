const assets = ['plasmapods.jpg'];
const path = 'https://zimjs.org/assets/';

const ready = () => {
  // Pods
  const pod = new Sprite({
    image: 'plasmapods.jpg',
    cols: 10,
    rows: 10,
  }).reg(CENTER);
  const cols = 4;
  const rows = 5;
  const pods = new Tile({
    obj: pod,
    cols,
    rows,
    spacingH: 10,
    spacingV: 10,
  })
    .scaleTo(S, 95, 95)
    .center();
  const options = [];
  loop(100, i => {
    options.push(i);
  });
  // Randomize the frame options
  shuffle(options);
  // Loop through all the pods and set the frame
  pods.loop((pod, i) => {
    pod.frame = options[i];
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
