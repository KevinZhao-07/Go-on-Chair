// -------------------- Ultrasonic Pins --------------------
const int trigPin = 4;
const int echoPin = 3;

// -------------------- Setup --------------------
void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("Ultrasonic sensor test started...");
}

// -------------------- Loop --------------------
void loop() {
  // Send a 10µs pulse to trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo pulse (blocking, max 30ms)
  long duration = pulseIn(echoPin, HIGH, 30000); // timeout 30ms

  // Convert to centimeters
  float distance = duration * 0.0343 / 2;

  Serial.print("Distance: ");
  if(duration == 0) {
    Serial.println("Out of range");
  } else {
    Serial.print(distance);
    Serial.println(" cm");
  }

  delay(100); // update every 100ms
}
