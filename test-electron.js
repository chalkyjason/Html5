const { app } = require('electron');

console.log('app:', app);
console.log('app.whenReady:', app.whenReady);

app.whenReady().then(() => {
  console.log('App is ready!');
  app.quit();
});
