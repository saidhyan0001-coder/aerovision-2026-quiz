export type Question = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: number;
};

export type ParticipantDetails = {
  fullName: string;
  institution: string;
  email: string;
  branch: string;
  year: string;
};

export type Feedback = {
  overall: number;
  technical: number;
  handsOn: number;
  facilitator: number;
  organization: number;
  learning: number;
  usefulPart: string;
  learned: string;
  favoriteSession: string;
  improvement: string;
  recommend: 'Yes' | 'No';
  futureWorkshops: 'Yes' | 'No';
};

export type Submission = {
  id: string;
  participant: ParticipantDetails;
  answers: number[];
  score: number;
  percentage: number;
  feedback: Feedback;
  submittedAt: string;
};

export const questions: Question[] = [
  { id: 1, topic: 'Drone fundamentals', question: 'What does UAV stand for?', options: ['Universal Aviation Vehicle', 'Unmanned Aerial Vehicle', 'Unified Autonomous Vehicle', 'Uncontrolled Air Vehicle'], answer: 1 },
  { id: 2, topic: 'Flight systems', question: 'Which component is often called the brain of a drone?', options: ['Flight controller', 'Propeller', 'Landing gear', 'Payload'], answer: 0 },
  { id: 3, topic: 'Sensors & IMU', question: 'What does a gyroscope primarily measure?', options: ['Altitude', 'Battery current', 'Angular velocity', 'Magnetic field'], answer: 2 },
  { id: 4, topic: 'Navigation', question: 'What is the primary role of GPS in an autonomous drone?', options: ['Control motor speed', 'Estimate position', 'Capture images', 'Measure air pressure'], answer: 1 },
  { id: 5, topic: 'Camera systems', question: 'What is the main purpose of a gimbal on a drone camera?', options: ['Increase radio range', 'Stabilize the camera view', 'Cool the battery', 'Store flight logs'], answer: 1 },
  { id: 6, topic: 'Computer vision', question: 'Which task helps a drone identify an object in a camera frame?', options: ['Object detection', 'Voltage regulation', 'Pulse-width modulation', 'Geofencing'], answer: 0 },
  { id: 7, topic: 'Autonomy', question: 'Which mode is designed to execute a preplanned GPS mission?', options: ['Acro', 'Manual', 'Auto', 'Disarm'], answer: 2 },
  { id: 8, topic: 'Practical concepts', question: 'What does an ESC control in a multirotor?', options: ['Motor speed', 'GPS satellites', 'Camera focus', 'Wind direction'], answer: 0 },
  { id: 9, topic: 'Safety', question: 'What should a pilot do before takeoff?', options: ['Disable failsafes', 'Check the area and aircraft', 'Fly directly over people', 'Remove the propellers'], answer: 1 },
  { id: 10, topic: 'Safety', question: 'What is a sensible response to a lost-link event when GPS is reliable?', options: ['Continue forever', 'Trigger configured RTL', 'Increase motor speed', 'Turn off the controller'], answer: 1 },
  { id: 11, topic: 'Flight systems', question: 'What is the primary purpose of an electronic speed controller (ESC)?', options: ['Control motor speed', 'Measure GPS accuracy', 'Store camera footage', 'Detect obstacles'], answer: 0 },
  { id: 12, topic: 'Sensors & IMU', question: 'Which sensor measures linear acceleration along the drone axes?', options: ['Barometer', 'Accelerometer', 'Compass', 'Optical camera'], answer: 1 },
  { id: 13, topic: 'Navigation', question: 'What does RTL commonly mean in drone flight modes?', options: ['Radio Telemetry Link', 'Return To Launch', 'Rotor Trim Level', 'Remote Tracking Location'], answer: 1 },
  { id: 14, topic: 'Computer vision', question: 'What is optical flow commonly used for in a drone?', options: ['Position estimation over a surface', 'Charging the battery', 'Encrypting telemetry', 'Balancing propellers'], answer: 0 },
  { id: 15, topic: 'Camera systems', question: 'Which camera type is useful for measuring heat signatures?', options: ['Thermal camera', 'Monochrome display', 'Wideband radio', 'Ultrasonic sensor'], answer: 0 },
  { id: 16, topic: 'Communication', question: 'Which protocol is widely used to exchange telemetry and commands with flight controllers?', options: ['MAVLink', 'HDMI', 'USB Audio', 'SMTP'], answer: 0 },
  { id: 17, topic: 'Autonomy', question: 'What is geofencing designed to do?', options: ['Limit flight into defined areas', 'Improve propeller thrust', 'Increase image brightness', 'Reduce battery weight'], answer: 0 },
  { id: 18, topic: 'Practical concepts', question: 'Why should a lithium-polymer battery be inspected before a flight?', options: ['Damage or swelling can create a safety risk', 'It changes the GPS map', 'It calibrates the camera', 'It increases Wi-Fi speed'], answer: 0 },
  { id: 19, topic: 'Safety', question: 'What is the safest general practice when operating near people?', options: ['Maintain a clear separation and follow local rules', 'Fly above the crowd', 'Disable the propeller guards', 'Ignore wind conditions'], answer: 0 },
  { id: 20, topic: 'Autonomy', question: 'What does obstacle avoidance help an autonomous drone do?', options: ['Detect and steer around hazards', 'Calculate exam scores', 'Replace the flight controller', 'Increase the radio license range'], answer: 0 },
];

export const defaultParticipant: ParticipantDetails = { fullName: '', institution: '', email: '', branch: '', year: '' };

export const defaultFeedback: Feedback = { overall: 0, technical: 0, handsOn: 0, facilitator: 0, organization: 0, learning: 0, usefulPart: '', learned: '', favoriteSession: '', improvement: '', recommend: 'Yes', futureWorkshops: 'Yes' };
