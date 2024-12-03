const ready = () => {
  new Circle(100, purple).center().drag();
};
new Frame({
  scaling: FIT,
  width: 1024,
  height: 768,
  color: light,
  outerColor: dark,
  ready,
});
