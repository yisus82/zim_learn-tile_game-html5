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
  // loop through all the pods and set its frame to a random number
  pods.loop(pod => {
    pod.frame = rand(99);
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
