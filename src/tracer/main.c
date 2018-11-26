#import<stdio.h>
#import<math.h>

#import "vector.c"
#import "project.c"

void traceRay(float *buffer, struct Projector* projector, int x, int y, int w, int h) {
    printf("%d %d\n", x, y);
    buffer[(y*h + x)*4] = x;
    buffer[(y*h + x)*4+1] = y;
    buffer[(y*h + x)*4+2] = x;
    buffer[(y*h + x)*4+3] = y;
}

void trace(float *buffer, struct Projector* projector) {
  /*const int chunk = 4;
  int chunksWide = (int)ceil((float)projector->Width / (float)chunk);
  int chunksHigh = (int)ceil((float)projector->Height / (float)chunk);
  for(int xChunk = 0; xChunk < chunksWide; xChunk++) {
    for(int yChunk = 0; yChunk < chunksHigh; yChunk++) {
      int toX =  (xChunk + 1) * chunk;
      if(toX > projector->Width) {
        toX = projector->Width;
      }
      int toY =  (xChunk + 1) * chunk;
      if(toY > projector->Height) {
        toY = projector->Height;
      }
      for(int x = xChunk * chunk; x < toX; x++) {
        for(int y = yChunk * chunk; y < toY; y++) {
          traceRay(buffer, projector, x, y, projector->Width, projector->Height);
        }
      }
    }
  }*/
  for(int x = 0; x < projector->Width; x++) {
    for(int y = 0; y < projector->Height; y++) {
      traceRay(buffer, projector, x, y, projector->Width, projector->Height);
    }
  }
}

int main() {
  const int width = 15;
  const int height = 15;

  struct Vector normal;
  normal.X = 0;
  normal.Y = 0;
  normal.Z = 1;
  struct Vector vec;
  vec.X = 1;
  vec.Y = 0;
  vec.Z = -1;
  //normalize(&vec);
  struct Vector into;
  printf("%f %f %f, %f\n", vec.X, vec.Y, vec.Z, length(&vec));
  refract(&into, &vec, &normal, 1, 1.45);
  printf("%f %f %f, %f\n", into.X, into.Y, into.Z, length(&into));
  mirror(&into, &vec, &normal);
  printf("%f %f %f, %f\n", into.X, into.Y, into.Z, length(&into));

  struct Projector projector = createProjector(0.0, 45.0, 0.0, 90.0, width, height);
  printf("F %f %f %f, %f\n", projector.Forward.X, projector.Forward.Y, projector.Forward.Z, length(&projector.Forward));
  printf("U %f %f %f, %f\n", projector.Up.X, projector.Up.Y, projector.Up.Z, length(&projector.Up));
  printf("R %f %f %f, %f\n", projector.Right.X, projector.Right.Y, projector.Right.Z, length(&projector.Right));
  printf("B %f %f %f, %f\n", projector.Backward.X, projector.Backward.Y, projector.Backward.Z, length(&projector.Backward));
  printf("D %f %f %f, %f\n", projector.Down.X, projector.Down.Y, projector.Down.Z, length(&projector.Down));
  printf("L %f %f %f, %f\n", projector.Left.X, projector.Left.Y, projector.Left.Z, length(&projector.Left));
  
  printf("F . U %f\n", dot(&projector.Forward, &projector.Up));
  printf("U . R %f\n", dot(&projector.Up, &projector.Right));
  printf("R . F %f\n", dot(&projector.Right, &projector.Forward));
  printf("R_h %f\n", projector.HorizontalRadius);
  printf("R_v %f\n", projector.VerticalRadius);

  printf("Projecting rays\n");

  int BufferLength = projector.Width * projector.Height * 4;
  printf("%d\n", BufferLength);
  float buffer[BufferLength];

  printf("%d x %d = %d\n", projector.Width, projector.Height, BufferLength);
  
  //for(int i = 0; i < 1; i++) {
    trace(buffer, &projector);
    //printf("%d\n", i);
  //}

  FILE *filePtr;
  filePtr = fopen("./data.png", "w");
  for(int i = 0; i < BufferLength; i++) {
    //printf("%f\n", i / (float)BufferLength);
    fprintf(filePtr, "%f\n", buffer[i]);
  }

/*
  printf("Done\n");
  for(int x = 0; x < width; x++) {
    for(int y = 0; y < height; y++) {
      project(&into, &projector, x, y);
      //printf("%f %f %f\n", into.X, into.Y, into.Z);
    }
  }
*/
  return 0;
}