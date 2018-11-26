#import<math.h>

struct Vector {
  float X;
  float Y;
  float Z;
};

float dot(struct Vector* a, struct Vector* b) {
  return a->X * b->X + a->Y * b->Y + a->Z * b->Z;
}

void cross(struct Vector* into, struct Vector* a, struct Vector* b) {
  float X = a->Y * b->Z - a->Z * b->Y;
  float Y = a->Z * b->X - a->X * b->Z;
  float Z = a->X * b->Y - a->Y * b->X;
  into->X = X;
  into->Y = Y;
  into->Z = Z;
}

void linearCombination(struct Vector* into, struct Vector* a, struct Vector* b, float partOfA, float partOfB) {
  into->X = a->X * partOfA + b->X * partOfB;
  into->Y = a->Y * partOfA + b->Y * partOfB;
  into->Z = a->Z * partOfA + b->Z * partOfB;
}

void add(struct Vector* into, struct Vector* a, struct Vector* b) {
  linearCombination(into, a, b, 1.0, 1.0);
}

void scalarMultiply(struct Vector* into, struct Vector* vec, float scalar) {
  into->X = vec->X * scalar;
  into->Y = vec->Y * scalar;
  into->Z = vec->Z * scalar;
}

void mirror(struct Vector* into, struct Vector* vec, struct Vector* normal) {
  float between = dot(vec, normal);

  into->X = vec->X - 2 * between * normal->X;
  into->Y = vec->Y - 2 * between * normal->Y;
  into->Z = vec->Z - 2 * between * normal->Z;
}

float length(struct Vector* vec) {
  return sqrt(vec->X*vec->X + vec->Y*vec->Y + vec->Z*vec->Z);
}

void normalize(struct Vector* vec) {
  float r = length(vec);
  vec->X /= r;
  vec->Y /= r;
  vec->Z /= r;
}

void refract(struct Vector* into, struct Vector* vec, struct Vector* normal, float n1, float n2) {
  float c = -dot(vec, normal);
  float r = (n1/n2);

  float asineRatio = asin(n2/n1);
  if(-asineRatio < c && c < asineRatio) { // Total reflection
    mirror(into, vec, normal);
    return;
  }

  float coefficient = (r * c - sqrt(1 - r*r * (1 - c*c)));
  into->X = r * vec->X + coefficient * normal->X;
  into->Y = r * vec->Y + coefficient * normal->Y;
  into->Z = r * vec->Z + coefficient * normal->Z;
}