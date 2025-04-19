function test(key) {
  for (let i = 0; i < 2; i++) {
    return {
      [key]: 5,
    };
  }
}
console.log(test("test1"));
console.log(test("test2"));
