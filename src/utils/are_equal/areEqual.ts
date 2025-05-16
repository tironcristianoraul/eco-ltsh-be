const areEqual = (arr1: Array<any>, arr2: Array<any>) =>
  JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort());

export default areEqual;
