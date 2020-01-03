import { run } from "./trace";
import {
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
  useEffect
} from "react";
import * as React from "react";

let threads = 2;
if (typeof navigator !== "undefined") {
  threads = navigator.hardwareConcurrency;
}

function Renderer(props: {
  dimension: number;
  scale: number;
  gridSize: number;
  threads: number;
}) {
  const ref = useRef<HTMLCanvasElement>();

  useLayoutEffect(() => {
    const cancel = run(
      props.dimension,
      props.gridSize,
      props.scale,
      props.threads,
      ref.current
    );
    return () => cancel();
  }, [props.dimension, props.gridSize, props.scale, props.threads]);

  return (
    <canvas
      style={{
        border: "1px solid black"
      }}
      ref={ref}
    />
  );
}

function useDebouncedValue<T>(initialValue: T, debounceTime: number = 500) {
  const [nextValue, setNextValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    let id = setTimeout(() => {
      setValue(nextValue);
    }, debounceTime);

    return () => clearTimeout(id);
  }, [nextValue, setValue]);

  return [value, nextValue, setNextValue] as [T, T, (val: T) => void];
}

function RangeInput(props: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange(e.target.valueAsNumber);
    },
    [props.onChange]
  );
  return (
    <div>
      <label>
        {props.title}:
        <input
          type="range"
          value={props.value}
          min={props.min}
          max={props.max}
          step={props.step}
          onChange={onChange}
        />
        <input
          type="number"
          min={props.min}
          max={props.max}
          value={props.value}
          onChange={onChange}
        />
      </label>
    </div>
  );
}
export function App() {
  const [dimension, currentDimension, setDimension] = useDebouncedValue(128);
  const [gridSize, currentGridSize, setGridSize] = useDebouncedValue(16);
  const [concurrency, currentConcurrency, setConcurrency] = useDebouncedValue(
    threads
  );
  const [scale, currentScale, setScale] = useDebouncedValue(1);
  return (
    <>
      <RangeInput
        title="dimension"
        value={currentDimension}
        onChange={setDimension}
        min={gridSize}
        max={2048}
        step={gridSize}
      />
      <RangeInput
        title="grid size"
        value={currentGridSize}
        onChange={setGridSize}
        min={16}
        max={512}
        step={16}
      />
      <RangeInput
        title="concurrency"
        value={currentConcurrency}
        onChange={setConcurrency}
        min={1}
        max={threads}
        step={1}
      />
      <RangeInput
        title="scale"
        value={currentScale}
        onChange={setScale}
        min={1}
        max={8}
        step={1}
      />
      <Renderer
        dimension={Math.max(gridSize, dimension)}
        gridSize={gridSize}
        scale={scale}
        threads={concurrency}
        key={[dimension, gridSize, scale, concurrency].join(" ")}
      />
    </>
  );
}
