



window.onload = function() {

  var min = 1;
  var max = 200;

  // Chart Data
  var data = [
    {label: 'Jan', value: 40},
    {label: 'Feb', value: 50},
    {label: 'March', value: 40},
    {label: 'April', value: 40},
    {label: 'May', value: 40}
  ];

  // Chart Specifications
  var targetId = 'chart';
  var canvasWidth = 600;
  var canvasHeight = 450;

  // Create Chart
  var chart = new BarChart(targetId, canvasWidth, canvasHeight, data);

};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
