import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scrollToTranslateX,
  percentToPx,
  bloqueProgressForScroll,
} from "./scroll-math.ts";

test("scrollToTranslateX: 0 scroll = 0 translate", () => {
  assert.equal(scrollToTranslateX(0, 1000, 5000, 1024), 0);
});

test("scrollToTranslateX: full scroll = -(canvasWidth - viewport)", () => {
  assert.equal(scrollToTranslateX(1000, 1000, 5000, 1024), -(5000 - 1024));
});

test("scrollToTranslateX: half scroll = half pan", () => {
  const result = scrollToTranslateX(500, 1000, 5000, 1024);
  assert.equal(result, -(5000 - 1024) / 2);
});

test("scrollToTranslateX: clamps below 0", () => {
  assert.equal(scrollToTranslateX(-100, 1000, 5000, 1024), 0);
});

test("scrollToTranslateX: clamps above full pan", () => {
  assert.equal(scrollToTranslateX(99999, 1000, 5000, 1024), -(5000 - 1024));
});

test("scrollToTranslateX: viewport bigger than canvas returns 0", () => {
  assert.equal(scrollToTranslateX(500, 1000, 800, 1024), 0);
});

test("percentToPx: 0% = 0", () => {
  assert.equal(percentToPx(0, 1000), 0);
});

test("percentToPx: 100% = total", () => {
  assert.equal(percentToPx(100, 1000), 1000);
});

test("percentToPx: 50% = half", () => {
  assert.equal(percentToPx(50, 1000), 500);
});

test("bloqueProgressForScroll: before bloque starts = 0", () => {
  assert.equal(bloqueProgressForScroll(100, 500, 1500), 0);
});

test("bloqueProgressForScroll: middle of bloque = 0.5", () => {
  assert.equal(bloqueProgressForScroll(1000, 500, 1500), 1 / 3);
});

test("bloqueProgressForScroll: after bloque ends = 1", () => {
  assert.equal(bloqueProgressForScroll(2000, 500, 1500), 1);
});
