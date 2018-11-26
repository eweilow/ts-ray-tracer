#import<math.h>
#import<stdbool.h>
#import "vector.c"

struct Projector {
  float Pitch;
  float Yaw;
  float Roll;

  int Width;
  int Height;

  int HalfWidth;
  int HalfHeight;

  float HorizontalRadius;
  float VerticalRadius;

  struct Vector Forward;
  struct Vector Backward;
  struct Vector Right;
  struct Vector Left;
  struct Vector Up;
  struct Vector Down;
};

float clamp(float value, float min, float max) {
  if(value < min) {
    return min;
  }
  if(value > max) {
    return max;
  }
  return value;
}

float placeInPeriod(float value, float period) {
  bool isNegative = value < 0.0;
  double currentPeriod = floor(fabsf(value) / period);

  if(isNegative) {
    return value + (currentPeriod + 1.0) * period;
  }
  return value - currentPeriod * period;
}

struct Projector createProjector(
  float yawDegrees,
  float pitchDegrees,
  float rollDegrees,
  float fovDegrees,
  int width,
  int height
) {
  yawDegrees = placeInPeriod(yawDegrees, 360.0);
  pitchDegrees = clamp(pitchDegrees, -85.0, 85.0);
  rollDegrees = placeInPeriod(rollDegrees, 360.0);

  float fov = fovDegrees / 180.0 * M_PI; 
  float theta = yawDegrees / 180.0 * M_PI;
  float phi = pitchDegrees / 180.0 * M_PI;
  float roll = rollDegrees / 180.0 * M_PI;

  struct Projector proj;

  proj.Forward.X = cos(theta) * cos(phi);
  proj.Forward.Y = sin(theta) * cos(phi);
  proj.Forward.Z = sin(phi);

  struct Vector up;
  struct Vector right;
  up.X = -cos(theta) * sin(phi);
  up.Y = -sin(theta) * sin(phi);
  up.Z = cos(phi);

  cross(&right, &(proj.Forward), &up);
  
  linearCombination(&proj.Up, &up, &right, cos(roll), sin(roll));
  linearCombination(&proj.Right, &right, &up, cos(roll), -sin(roll));

  scalarMultiply(&proj.Backward, &proj.Forward, -1);
  scalarMultiply(&proj.Down, &proj.Up, -1);
  scalarMultiply(&proj.Left, &proj.Right, -1);

  // TODO: able to roll
  proj.Pitch = theta;
  proj.Yaw = phi;
  proj.Roll = roll;

  proj.Width = width;
  proj.Height = height;
  proj.HalfWidth = width/2;
  proj.HalfHeight = height/2;
  
  proj.HorizontalRadius = tan(fov / 2);
  proj.VerticalRadius = proj.HorizontalRadius / (float)width * (float)height;

  return proj;
}

void project(struct Vector* into, struct Projector* projector, int x, int y) {
  float ratioX = projector->HorizontalRadius * (x - projector->HalfWidth) / (float)projector->HalfWidth;
  float ratioY = projector->VerticalRadius * (y - projector->HalfHeight) / (float)projector->HalfHeight;

  linearCombination(into, &projector->Right, &projector->Up, ratioX, ratioY);
  add(into, into, &projector->Forward);
  normalize(into);
}