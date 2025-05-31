// sketch.js
let video;
let handpose;
let predictions = [];

let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let confirmed = false;

let questions = [
  {
    question: "哪一項最可能造成認知過載？",
    options: ["動畫同時搭配旁白與文字", "逐步釋出重點", "圖文並茂教學"],
    answer: 0
  },
  {
    question: "哪個工具可用於製作互動教材？",
    options: ["Photoshop", "Excel", "H5P"],
    answer: 2
  },
  {
    question: "下列哪一項屬於教學設計流程模型？",
    options: ["Bloom", "ADDIE", "AI"],
    answer: 1
  }
];

function setup() {
  createCanvas(800, 600);
  video = createCapture(VIDEO);
  video.size(800, 600);
  video.hide();

  handpose = ml5.handpose(video, () => console.log("Handpose loaded"));
  handpose.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  background(20);
  image(video, 0, 0, width, height);

  drawInterface();
  handleGestureInput();
}

function drawInterface() {
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text("智慧教室大冒險", 20, 40);

  let q = questions[currentQuestion];
  textSize(18);
  text(q.question, 20, 100);

  for (let i = 0; i < q.options.length; i++) {
    fill(i === selectedAnswer ? 'yellow' : 'white');
    text((i + 1) + ". " + q.options[i], 40, 150 + i * 40);
  }

  textSize(16);
  fill(200);
  text("得分：" + score, 20, height - 20);

  if (confirmed) {
    let correct = q.answer === selectedAnswer;
    fill(correct ? 'lightgreen' : 'red');
    text(correct ? "✔ 正確！" : "✘ 錯誤", 600, 100);
    if (frameCount % 60 === 0) nextQuestion();
  }
}

function handleGestureInput() {
  if (predictions.length < 2) return;

  let leftHand = predictions[0];
  let rightHand = predictions[1];

  let leftCount = countExtendedFingers(leftHand);
  if (leftCount >= 1 && leftCount <= 3) {
    selectedAnswer = leftCount - 1;
  }

  let rightGesture = detectOKGesture(rightHand);
  if (rightGesture && !confirmed && selectedAnswer !== null) {
    confirmed = true;
    if (selectedAnswer === questions[currentQuestion].answer) {
      score += 10;
    }
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= questions.length) {
    noLoop();
    background(0);
    fill(255);
    textSize(30);
    textAlign(CENTER);
    text("🎉 遊戲結束！你的分數是：" + score, width / 2, height / 2);
  } else {
    selectedAnswer = null;
    confirmed = false;
  }
}

function countExtendedFingers(hand) {
  const fingers = hand.annotations;
  let count = 0;
  for (let key in fingers) {
    let d = dist(...fingers[key][0], ...fingers[key][3]);
    if (d > 40) count++;
  }
  return count;
}

function detectOKGesture(hand) {
  if (!hand) return false;
  let thumbTip = hand.annotations.thumb[3];
  let indexTip = hand.annotations.indexFinger[3];
  let d = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
  return d < 30;
}
