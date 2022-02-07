const os = require('./os');
const ingredients = [
  { id: 'salt', name: 'salt', percentage: 0.02 },
  { id: 'flour', name: 'flour', percentage: 1 },
  { id: 'water', name: 'water', percentage: 0.7 },
  { id: 'starter', name: 'starter', percentage: 0.25, hydration: 1 }
];
const f = new os.Formula(ingredients);
console.log(f.weights(1200));
