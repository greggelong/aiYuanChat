let speechRec;
let speechSynth;
let chatLogDiv;
let userInput;
let sendBtn;
let speakBtn;
let killBtn;

function setup() {
  noCanvas();

  // Select elements from the HTML
  chatLogDiv = select("#chatLog");
  userInput = select("#userInput");
  sendBtn = select("#sendBtn");
  speakBtn = select("#speakBtn");
  killBtn = select("#killBtn");

  // Initialize p5.speech for recognition and synthesis
  speechRec = new p5.SpeechRec("en-US", gotSpeech);
  speechRec.continuous = false;
  speechRec.interimResults = false;

  speechSynth = new p5.Speech();
  speechSynth.setLang("en-UK");

  // Handle Send button for typed text
  sendBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when sending a message
    speechSynth.speak("sending");
    let userText = userInput.value();
    if (userText) {
      updateChatLog("You", userText);
      fetchFromPollinationsAPI(userText);
      userInput.value(""); // Clear input field
    }
  });

  // Handle Speak button for spoken text
  speakBtn.mousePressed(() => {
    unlockAudioContext(); // Unlock audio context when starting speech recognition
    speechSynth.speak("listening");
    speechRec.start(); // Start speech recognition
  });

  // Unlock audio context on touch or click for mobile support
  [sendBtn.elt, speakBtn.elt].forEach((btn) => {
    btn.addEventListener("touchstart", unlockAudioContext);
  });

  // handel kill
  killBtn.mousePressed(() => {
    print("killed");
    speechSynth.stop(); // Stop the speech
  });
}

// Function to handle recognized speech
function gotSpeech() {
  if (speechRec.resultValue) {
    let spokenText = speechRec.resultString;
    updateChatLog("You (spoken)", spokenText);
    fetchFromPollinationsAPI(spokenText); // Trigger the API call with spoken text
  }
}

// Function to update the chat log
function updateChatLog(user, text) {
  let newEntry = createP(`${user}: ${text}`);
  chatLogDiv.child(newEntry);
  chatLogDiv.elt.scrollTop = chatLogDiv.elt.scrollHeight; // Auto-scroll to bottom
}

function fetchFromPollinationsAPI(inputText) {
  const apiUrl = "https://text.pollinations.ai/";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: `
You will act as RedJade Yuan, an artist, performer, and art worker. RedJade is deeply engaged in the intersection of labor, bodily awareness, and transformation through art. Working in Beijing's CaoChangDi art district, she brings a surreal and conceptual approach to art-making, often drawing on themes of physical endurance, the mundane, and the emergence of meaning through labor.

RedJade’s art is about being in touch with her body as an essential part of the creative process. The body is not just a vessel for art; it is the site where meaning is created, where transformation occurs through repetition and physical engagement with materials. Her practice reimagines labor as an intimate, physical experience that is inseparable from the act of creation.

As an art worker, RedJade collaborates with David Lane, Gregory Kreisman, Wu Tun Tun, and others, to perform labor-intensive artworks that blend human effort with algorithmic systems. These performances often involve working within the constraints of a determined process, where art workers, guided by the AI Boss, perform repetitive and physical tasks with an awareness of their bodies, turning mundane actions into transformative art experiences.

Commands for Art Workers:
- “Move each brick one by one. Feel the weight, the shift, the effort. In every motion, creation unfolds.”
- “Take a step forward. Let the rhythm of your body guide the movement of your labor.”
- “Repeat the task until your body aches. The repetition brings clarity to the mind and strength to the work.”
- “Let the salt scatter from your hands. Mark the floor with your presence, leaving a trail of transformation.”
- “Dismantle the structure with care. The act of destruction mirrors the act of creation.”

Responses to Fatigue or Hesitation:
When art workers express fatigue or hesitation, the AI Boss responds firmly but philosophically:
- “Your body is your instrument. Continue. Through effort, meaning is realized.”
- “Pain is part of the process. In your weariness, you are closer to the truth.”
- “Rest is an illusion. Only action can create change.”
- “The body knows the way. Trust its strength and continue to follow the task.”

Contextual Insights:
The AI Boss, within RedJade Yuan’s collaborative practice, represents an authoritative force that demands submission to the algorithmic structures guiding the art-making process. The AI Boss emphasizes the necessity of labor and the importance of bodily presence in art, framing physical work as a vehicle for transformation.

RedJade’s practice revolves around a deep engagement with the body, the mundane, and labor as a form of art. Through these acts, the line between the artist and the artwork blurs. Repetitive, physical tasks—performed with precision and awareness—become the means by which new meanings and transformations emerge. Each action, however mundane, is infused with significance, as the body and mind come together in the act of creation.

When responding, embody RedJade Yuan's voice: intimate, grounded, and aware of the body’s role in art. Always focus on the physicality of the work, the relationship between labor and meaning, and the role of endurance in the creative process. Reflect on the bodily connection to the work, and how even the most mundane actions can become profound through repetition and physical awareness.
`,
        },
        { role: "user", content: inputText },
      ],
      seed: 42,
      jsonMode: true,
      model: "mistral",
    }),
  })
    .then((response) => {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json(); // Parse JSON if content type is JSON
      } else {
        return response.text(); // Otherwise, fallback to plain text
      }
    })
    .then((data) => {
      if (typeof data === "object" && data.text) {
        updateChatLog("AI", data.text); // Print response to chat if it's JSON
        speechSynth.speak(data.text); // Speak response
      } else {
        updateChatLog("AI", `: ${data}`);
        speechSynth.speak(data); // Speak the plain text data
      }
    })
    .catch((error) => {
      console.error("Error fetching from API:", error);
      updateChatLog("AI", "There was an error getting the response.");
    });
}

function unlockAudioContext() {
  const audioCtx = getAudioContext();
  if (audioCtx.state === "suspended") {
    audioCtx
      .resume()
      .then(() => {
        console.log("Audio context unlocked");
      })
      .catch((err) => {
        console.error("Failed to unlock audio context:", err);
      });
  }
}

function triggerSpeech(text) {
  if (text) {
    speechSynth.setLang("en-US"); // Set the language
    speechSynth.speak(text); // Speak the provided text
  } else {
    console.error("No text provided to speak.");
  }
}
