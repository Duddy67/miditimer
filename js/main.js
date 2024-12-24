document.addEventListener('DOMContentLoaded', () => {
    const midi = new MIDI();
    // The M-Audio screensaver mode goes off about every ten minutes.
    // Set the timer to nine minutes (in milliseconds) to reset the screensaver mode before it goes off.
    const nineMinutes = 540000;
    // Dummy MIDI control change message (sends a zero value to CC 102 (undefined) on channel 1).
    let MIDIMessage = [0xB0, 66, 0];

    // Check for info events sent by the MIDI class.
    document.addEventListener('info', (e) => {
        const info = e.detail.data.info;
        const outputPortId = e.detail.data.outputPortId;

        if (info.startsWith('Output port') || outputPortId === null) {
            const infoPanel = document.getElementById('info');

            // Display info of each available MIDI port.
            let div = document.createElement('div');
            div.setAttribute('class', 'col-12 mt-2 p-2 border rounded');

            infoPanel.append(div);

            let text = document.createTextNode(info);

            // Create a radio button for each port.
            if (outputPortId) {
                let radio = document.createElement('input');
                radio.setAttribute('type', 'radio');
                radio.setAttribute('name', 'ports');
                radio.setAttribute('value', outputPortId);
                radio.setAttribute('class', 'form-check-input m-1 d-block port');

                // Select the M-Audio USB Output by default.
                if (info.includes('Oxygen Pro 61 USB MIDI')) {
                    radio.checked = true;
                    midi.setOutputPortId(outputPortId);
                }

                div.append(radio);

                // Check whenever a port is clicked.
                radio.addEventListener('click', (e) => {
                    midi.setOutputPortId(e.target.value);
                });
            }

            div.append(text);
        }
    });

    // Check for messages coming from the sendMIDIMessage function.
    document.addEventListener('message', (e) => {
        // Display the message.
        const message = document.getElementById('message');
        message.innerHTML = e.detail.data;
    });

    midi.initMIDIAccess();

    // Timer calling the sendMIDIEvent function every nine minutes.
    setInterval(sendMIDIEvent, nineMinutes, midi, MIDIMessage);

    document.getElementById('sendButton').addEventListener('click', (e) => {
        midi.sendMIDIMessage(MIDIMessage);
    });
});

function sendMIDIEvent(midi, message) {
    midi.sendMIDIMessage(message);
}

