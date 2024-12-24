
class MIDI {
    #midiAccess = null;
    #info = '';
    #outputPortId = null;
    #counter = 1;

    /*
     * In case of success, a MIDIAccess object is passed as parameter.
     * NOTE: An arrow function has to be used here or 'this' won't be available.
     */
    #onMIDISuccess = (midiAccess) => {
        // Set the MIDIAccess object.
        this.#midiAccess = midiAccess;

        console.log(this.#midiAccess);
        
        this.#listInputsAndOutputs();

        // Loop through the inputs and assign the onmidimessage listener.
        for (var input of this.#midiAccess.inputs.values()) {
            // Add an onmidimessage listener to each input.
            // The onMIDIMessage callback will be triggered whenever a message 
            // is sent by the input port.
            input.onmidimessage = this.#onMIDIMessage;
        }

        //this.sendMIDIMessage(); // Test output sendings.

        return true;
    }

    #onMIDIFailure = () => {
        this.#info = 'Could not access your MIDI devices.';
        console.log(this.#info);
        this.#sendMIDIInfo(this.#info);
        return false;
    }

    #listInputsAndOutputs() {
        // Loop through the available inputs.
        for (const entry of this.#midiAccess.inputs) {
            const input = entry[1];
            this.#info = `Input port [type:'${input.type}']` +
                          ` id:'${input.id}'` +
                          ` manufacturer:'${input.manufacturer}'` +
                          ` name:'${input.name}'` +
                          ` version:'${input.version}'`;

            console.log(this.#info);
            this.#sendMIDIInfo(this.#info, input.id);
        }

        // Loop through the available outputs.
        for (const entry of this.#midiAccess.outputs) {
            const output = entry[1];
            this.#info = `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`;
            console.log(this.#info);
            this.#sendMIDIInfo(this.#info, output.id);
        }
    }

    /*
     * Sends the MIDI messages coming from the inputs through a 'midi' custom event.
     */
    #onMIDIMessage(message) {
        const event = new CustomEvent('midi', {
            detail: {
                data: message
            }
        });

        document.dispatchEvent(event);
    }

    #sendMIDIInfo(info, outputPortId) {
        outputPortId = outputPortId == undefined ? null : outputPortId;

        const event = new CustomEvent('info', {
            detail: {
                data: {'info': info, 'outputPortId': outputPortId}
            }
        });

        document.dispatchEvent(event);
    }

    #sendMessage(message) {
        const event = new CustomEvent('message', {
            detail: {
                data: message
            }
        });

        document.dispatchEvent(event);
    }

    initMIDIAccess() {
        // Check first if the browser supports WebMIDI.

        this.#info = (navigator.requestMIDIAccess) ? 'This browser supports WebMIDI !' : 'WebMIDI is not supported in this browser.'; 

        console.log(this.#info);
        this.#sendMIDIInfo(this.#info);

        if (!navigator.requestMIDIAccess) {
            return false;
        }

        // Get a MIDIAccess object. 
        // The requestMIDIAccess method returns a promise. So, 2 callback functions are passed 
        // as arguments in case or succes or failure. 
        navigator.requestMIDIAccess().then(this.#onMIDISuccess, this.#onMIDIFailure);
    }

    setOutputPortId(id) {
        this.#outputPortId = id;
    }

    sendMIDIMessage(message) {
        let msg = 'Sending MIDI message... (' + this.#counter + ')';

        // Check the output port is available.
        if (this.#midiAccess.outputs.get(this.#outputPortId)) {
            const output = this.#midiAccess.outputs.get(this.#outputPortId);
            output.send(message); //omitting the timestamp means send immediately.
            console.log(msg);
            this.#counter++;
        }
        else {
            msg = 'The MIDI outport port: ' + this.#outputPortId + ' is not available.';
            console.log(msg);
            this.#counter = 1;
        }

        this.#sendMessage(msg);
    }
}
