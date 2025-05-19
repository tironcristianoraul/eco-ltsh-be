const allowedExtensionsLowercase = [
  "png",
  "jpg",
  "jpeg",
  "bmp",
  "avif",
  "webp",
  "heic",
];
const allowedExtensionsUppercase = allowedExtensionsLowercase.map((ext) =>
  ext.toUpperCase()
);

const allowedExtensions = [
  ...allowedExtensionsLowercase,
  ...allowedExtensionsUppercase,
];

const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

export { allowedExtensions, MAX_TOTAL_SIZE };
