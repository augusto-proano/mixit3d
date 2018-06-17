var visualizer = new AudioVisualizer();
const executeVisualizer = () => {
    visualizer.createBars();
    visualizer.setupAudioProcessing();
    visualizer.start();
}

function AudioVisualizer() {

    //constants
    this.numberOfBars = 64;

    //bars
    this.bars = new Array();

    //audio
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.analyser;
}


//create the bars required to show the visualization

AudioVisualizer.prototype.createBars = function () {



    //iterate and create bars

    for (var i = 0; i < this.numberOfBars; i++) {



        //create a bar

        var barGeometry = new THREE.BoxGeometry(2, 2, 2);



        //create a material

        var material = new THREE.MeshPhongMaterial({

            color: this.getRandomColor(),

            ambient: 0x808080,

            specular: 0xffffff

        });



        //create the geometry and set the initial position

        this.bars[i] = new THREE.Mesh(barGeometry, material);

        this.bars[i].position.set(i - this.numberOfBars / 2, 60, -60);



        //add the created bar to the scene

        scene.add(this.bars[i]);

    }

};



AudioVisualizer.prototype.setupAudioProcessing = function () {

    //get the audio context

    this.audioContext = new AudioContext();



    //create the javascript node

    this.javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.javascriptNode.connect(this.audioContext.destination);



    //create the source buffer

    this.sourceBuffer = this.audioContext.createBufferSource();



    //create the analyser node

    this.analyser = this.audioContext.createAnalyser();

    this.analyser.smoothingTimeConstant = 0.3;

    this.analyser.fftSize = 512;



    //connect source to analyser

    this.sourceBuffer.connect(this.analyser);



    //analyser to speakers

    this.analyser.connect(this.javascriptNode);



    //connect source to analyser

    this.sourceBuffer.connect(this.audioContext.destination);



    var that = this;



    //this is where we animates the bars

    this.javascriptNode.onaudioprocess = function () {



        // get the average for the first channel

        var array = new Uint8Array(that.analyser.frequencyBinCount);

        that.analyser.getByteFrequencyData(array);



        //render the scene and update controls

        visualizer.renderer.render(visualizer.scene, visualizer.camera);

        visualizer.controls.update();



        var step = Math.round(array.length / visualizer.numberOfBars);



        //Iterate through the bars and scale the z axis

        for (var i = 0; i < visualizer.numberOfBars; i++) {

            var value = array[i * step] / 4;

            value = value < 1 ? 1 : value;

            visualizer.bars[i].scale.z = value;

        }

    }



};


//start the audio processing

AudioVisualizer.prototype.start = function (buffer) {

    this.audioContext.decodeAudioData(buffer, decodeAudioDataSuccess, decodeAudioDataFailed);

    var that = this;



    function decodeAudioDataSuccess(decodedBuffer) {

        that.sourceBuffer.buffer = decodedBuffer

        that.sourceBuffer.start(0);

    }



    function decodeAudioDataFailed() {

        debugger

    }

};



//util method to get random colors to make stuff interesting

AudioVisualizer.prototype.getRandomColor = function () {

    var letters = '0123456789ABCDEF'.split('');

    var color = '#';

    for (var i = 0; i < 6; i++) {

        color += letters[Math.floor(Math.random() * 16)];

    }

    return color;

};
