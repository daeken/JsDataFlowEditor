var audioGraph;

var audioTheme = {
	lineStrokeWidth: 5
};

$(document).ready(function() {
	audioGraph = new graphEditor('audio-graph', 640, 480, audioTheme);
	
	function addNode(x, y, name, inputs, outputs) {
		inputs = inputs.split(',');
		outputs = outputs.split(',');
		var node = new graphNode(name, name);
		
		for(var i in inputs) {
			var input = inputs[i];
			var multi = input.substring(0, 1) == '*';
			if(multi) input = input.substring(1);
			
			node.addPoint(input, 'in', multi);
		}
		for(var i in outputs)
			if(outputs[i] != '')
				node.addPoint(outputs[i], 'out');
		
		audioGraph.addNode(x, y, node);
	}
	addNode(50, 25, 'Oscillator', 'Frequency,Shape', 'Waveform');
	addNode(50, 125, 'Oscillator', 'Frequency,Shape', 'Waveform');
	addNode(250, 75, 'Mixer', '*Inputs', 'Waveform');
	addNode(450, 75, 'Player', 'Waveform', '');
});
