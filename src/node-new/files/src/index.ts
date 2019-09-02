export function main() {
  return 'hello from <%= name %>'
}

if (require.main === module) {
  console.log(main())
}
